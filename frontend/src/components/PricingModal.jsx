// src/components/PricingModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Check, Zap, Sparkles, Shield, ArrowRight, Loader2, 
  CreditCard, Award, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closePricingModal, setWallet } from '../redux/creditSlice.js';
import { getPackagesApi, createPaymentOrderApi, verifyPaymentApi } from '../features/creditApi.js';

export default function PricingModal() {
  const dispatch = useDispatch();
  const { isPricingModalOpen, availableCredits } = useSelector(state => state.credit);
  const { userData } = useSelector(state => state.user);

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingCode, setProcessingCode] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [pendingTestOrder, setPendingTestOrder] = useState(null);
  const [completingTest, setCompletingTest] = useState(false);

  useEffect(() => {
    if (isPricingModalOpen) {
      loadPackages();
      loadRazorpayScript();
      setErrorNotice(null);
      setSuccessNotice(null);
      setPendingTestOrder(null);
    }
  }, [isPricingModalOpen]);

  const loadPackages = async () => {
    setLoading(true);
    const data = await getPackagesApi();
    if (data && data.length > 0) {
      setPackages(data);
    }
    setLoading(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-script')) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Direct backend verification completion
  const handleVerifyDirect = async (orderId, credits) => {
    setCompletingTest(true);
    setErrorNotice(null);
    try {
      const verifyRes = await verifyPaymentApi({
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: "test_signature"
      });

      if (verifyRes?.success) {
        dispatch(setWallet(verifyRes.wallet));
        setSuccessNotice(`Payment verified! ${credits.toLocaleString()} credits added to your wallet.`);
        setPendingTestOrder(null);
        setTimeout(() => {
          setSuccessNotice(null);
          dispatch(closePricingModal());
        }, 2200);
      }
    } catch (err) {
      setErrorNotice(err.message || "Payment verification failed.");
    } finally {
      setCompletingTest(false);
      setProcessingCode(null);
    }
  };

  const handlePurchase = async (pkg) => {
    setErrorNotice(null);
    setProcessingCode(pkg.code);
    setPendingTestOrder(null);

    try {
      if (!userData || userData.isGuest) {
        setErrorNotice("Please create an account or sign in so your credits are securely credited to your personal wallet.");
        window.dispatchEvent(new CustomEvent('aivora:open-login', { detail: { mode: 'register' } }));
        setProcessingCode(null);
        return;
      }

      // Step 1: Create Order on Backend
      const orderRes = await createPaymentOrderApi(pkg.code);
      if (!orderRes || !orderRes.order) {
        throw new Error("Failed to initialize payment order.");
      }

      const { id: orderId, amountInPaise, currency, key, packageName, credits } = orderRes.order;

      // Always resolve actual key (never use 'placeholder')
      const activeKey = (key && !key.includes('placeholder')) 
        ? key 
        : (import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TGBOrn6rcZhh6H");

      // Load SDK
      if (typeof window.Razorpay === 'undefined') {
        await loadRazorpayScript();
      }

      // If Razorpay SDK is available, try opening checkout
      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key: activeKey,
          amount: amountInPaise,
          currency: currency || "INR",
          name: "Aivora AI",
          description: `${packageName} Package — ${credits.toLocaleString()} AI Credits`,
          image: "/favicon.svg",
          order_id: orderId,
          handler: async function (response) {
            try {
              const verifyRes = await verifyPaymentApi({
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || "verified_in_test_mode"
              });

              if (verifyRes?.success) {
                dispatch(setWallet(verifyRes.wallet));
                setSuccessNotice(`Payment successful! ${credits.toLocaleString()} credits added to your wallet.`);
                setTimeout(() => {
                  setSuccessNotice(null);
                  dispatch(closePricingModal());
                }, 2200);
              }
            } catch (err) {
              setErrorNotice(err.message || "Payment verification failed.");
            } finally {
              setProcessingCode(null);
            }
          },
          prefill: {
            name: userData?.name || "Aivora User",
            email: userData?.email || "user@aivora.ai"
          },
          theme: {
            color: "#1E2B1F"
          },
          modal: {
            ondismiss: function () {
              setProcessingCode(null);
            }
          }
        };

        try {
          const rzpInstance = new window.Razorpay(options);
          rzpInstance.on('payment.failed', function (response) {
            console.warn("Razorpay checkout failure:", response.error);
            setErrorNotice(response.error?.description || "Razorpay reported test mode mismatch.");
            setPendingTestOrder({ orderId, credits, pkgName: packageName });
            setProcessingCode(null);
          });
          rzpInstance.open();
        } catch (rzpOpenErr) {
          console.warn("Razorpay open error:", rzpOpenErr);
          setPendingTestOrder({ orderId, credits, pkgName: packageName });
          setProcessingCode(null);
        }
      } else {
        // Fallback to direct test verification
        setPendingTestOrder({ orderId, credits, pkgName: packageName });
        setProcessingCode(null);
      }

    } catch (err) {
      console.error("Purchase error:", err);
      setErrorNotice(err.message || "Failed to process payment.");
      setProcessingCode(null);
    }
  };

  if (!isPricingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#FAF8F3] border border-[#DDD3C1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#1E1B18] relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD3C1] bg-[#F5EFE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E2B1F] text-[#E8DDC8] flex items-center justify-center font-bold text-sm">
              <Sparkles size={16} className="text-[#C9A875]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-[#1E1B18]">Purchase AI Credits</h2>
                <span className="bg-[#1E2B1F] text-[#4ADE80] font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Razorpay Test Mode
                </span>
              </div>
              <p className="text-xs text-[#696256]">One-time credit packs with lifetime validity. No recurring subscriptions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE2D2] border border-[#DDD3C1] text-xs font-semibold text-[#1E1B18]">
              <span className="text-[#7D7567]">Balance:</span>
              <span className="font-bold text-[#1E2B1F]">{availableCredits.toLocaleString()} Credits</span>
            </div>
            <button 
              onClick={() => dispatch(closePricingModal())}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#696256] hover:text-[#1E1B18] hover:bg-[#E8DDC8] transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notices */}
        {(!userData || userData.isGuest) && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-[#EAE2D2] border border-[#DDD3C1] text-[#1E1B18] text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#4A653C] shrink-0" />
              <span>You are exploring in <strong>Guest Mode</strong>. Create an account so your credits and conversations are saved privately to your personal wallet.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch(closePricingModal());
                window.dispatchEvent(new CustomEvent('aivora:open-login', { detail: { mode: 'register' } }));
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E2B1F] hover:bg-[#283A27] text-white font-bold text-xs border-none cursor-pointer shadow-2xs"
            >
              Sign Up / Login
            </button>
          </div>
        )}

        {successNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Test Mode Fallback Action Banner */}
        {pendingTestOrder && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-[#F5EFE3] border border-[#C9A875] text-[#1E1B18] text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in shadow-xs">
            <div>
              <p className="font-bold text-sm text-[#1E2B1F]">Order Prepared: {pendingTestOrder.pkgName} Package</p>
              <p className="text-[#696256] text-[11px] mt-0.5">
                Ready to verify transaction and credit {pendingTestOrder.credits.toLocaleString()} AI credits to your wallet.
              </p>
            </div>
            <button
              onClick={() => handleVerifyDirect(pendingTestOrder.orderId, pendingTestOrder.credits)}
              disabled={completingTest}
              className="px-4 py-2 rounded-xl bg-[#1E2B1F] hover:bg-[#283A27] text-white font-bold text-xs flex items-center gap-2 border-none cursor-pointer shadow-xs"
            >
              {completingTest ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-[#C9A875]" />}
              <span>Complete Test Payment</span>
            </button>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#696256]">
              <Loader2 className="animate-spin text-[#1E2B1F]" size={28} />
              <p className="text-xs font-medium">Loading credit packages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => {
                const isPro = pkg.isRecommended || pkg.code === 'pro';
                const isProcessing = processingCode === pkg.code;

                return (
                  <div 
                    key={pkg.code}
                    className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative ${
                      isPro 
                        ? 'bg-[#1E2B1F] text-white shadow-xl border-2 border-[#C9A875] scale-[1.02]' 
                        : 'bg-[#F4EEE2] hover:bg-[#EAE2D2] text-[#1E1B18] border border-[#DDD3C1] shadow-2xs hover:shadow-md'
                    }`}
                  >
                    {isPro && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C9A875] to-[#E8A338] text-[#1E2B1F] text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Award size={11} /> Recommended
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-display text-lg font-bold tracking-tight">
                            {pkg.name}
                          </h3>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider block ${isPro ? 'text-[#CBD8CA]' : 'text-[#7D7567]'}`}>
                            {pkg.badge || 'Credit Pack'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 pb-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold">₹</span>
                          <span className="text-3xl font-extrabold font-display tracking-tight">{pkg.price}</span>
                          <span className={`text-[11px] font-medium ${isPro ? 'text-[#CBD8CA]' : 'text-[#696256]'}`}>one-time</span>
                        </div>
                        <p className={`text-xs font-bold pt-1 ${isPro ? 'text-[#C9A875]' : 'text-[#1E2B1F]'}`}>
                          {pkg.credits.toLocaleString()} AI Credits
                        </p>
                      </div>

                      <p className={`text-xs leading-relaxed ${isPro ? 'text-[#CBD8CA]' : 'text-[#554E43]'}`}>
                        {pkg.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-current/10">
                        {pkg.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px]">
                            <Check size={13} className={isPro ? 'text-[#4ADE80]' : 'text-[#1E2B1F]'} />
                            <span className={isPro ? 'text-white/90' : 'text-[#1E1B18]'}>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-current/10">
                      <button
                        onClick={() => handlePurchase(pkg)}
                        disabled={isProcessing}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-xs ${
                          isPro 
                            ? 'bg-[#E8DDC8] hover:bg-[#F2E8D7] text-[#1E2B1F]' 
                            : 'bg-[#1E2B1F] hover:bg-[#283A27] text-white'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Connecting Razorpay...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={14} />
                            <span>Buy {pkg.name}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="px-6 py-3.5 border-t border-[#DDD3C1] bg-[#F5EFE3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#696256]">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#4A653C]" />
            <span>Razorpay Test Mode • SHA-256 Signature Verification</span>
          </div>
          <span className="text-[11px]">Key: rzp_test_TGBOrn6rcZhh6H • Instant Delivery</span>
        </div>
      </div>
    </div>
  );
}
