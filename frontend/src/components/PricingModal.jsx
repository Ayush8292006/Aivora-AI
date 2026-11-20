// src/components/PricingModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Check, Zap, Sparkles, Shield, ArrowRight, Loader2, 
  CreditCard, Award, CheckCircle2 
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

  useEffect(() => {
    if (isPricingModalOpen) {
      loadPackages();
      loadRazorpayScript();
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

  const handlePurchase = async (pkg) => {
    setErrorNotice(null);
    setProcessingCode(pkg.code);

    try {
      if (!userData || userData.isGuest) {
        setErrorNotice("Please log in or create an account first to purchase credits.");
        setProcessingCode(null);
        return;
      }

      // Step 1: Create Order on Backend
      const orderRes = await createPaymentOrderApi(pkg.code);
      if (!orderRes || !orderRes.order) {
        throw new Error("Failed to initialize payment order.");
      }

      const { id: orderId, amountInPaise, currency, key, packageName, credits } = orderRes.order;

      // Check if Razorpay SDK loaded
      if (typeof window.Razorpay === 'undefined') {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Could not load payment gateway. Please check your network.");
        }
      }

      // Step 2: Open Razorpay Checkout Options
      const options = {
        key: key || "rzp_test_placeholder",
        amount: amountInPaise,
        currency: currency || "INR",
        name: "Aivora AI",
        description: `${packageName} Package — ${credits.toLocaleString()} AI Credits`,
        image: "/favicon.svg",
        order_id: orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify Payment Signature on Backend
            const verifyRes = await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "test_signature"
            });

            if (verifyRes?.success) {
              dispatch(setWallet(verifyRes.wallet));
              setSuccessNotice(`Payment successful! ${credits.toLocaleString()} credits added to your wallet.`);
              setTimeout(() => {
                setSuccessNotice(null);
                dispatch(closePricingModal());
              }, 2500);
            }
          } catch (err) {
            setErrorNotice(err.message || "Payment verification failed.");
          } finally {
            setProcessingCode(null);
          }
        },
        prefill: {
          name: userData?.name || "Aivora Creator",
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

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        setErrorNotice(response.error?.description || "Payment failed or was cancelled.");
        setProcessingCode(null);
      });
      rzpInstance.open();

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
              <h2 className="text-base font-bold tracking-tight text-[#1E1B18]">Purchase AI Credits</h2>
              <p className="text-xs text-[#696256]">One-time credit packs. No subscriptions or recurring charges.</p>
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
        {successNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <X size={16} />
            <span>{errorNotice}</span>
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
                            <span>Connecting Gateway...</span>
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
            <span>256-Bit SSL Encrypted Razorpay Test Gateway</span>
          </div>
          <span className="text-[11px]">Credits never expire • Instant wallet delivery</span>
        </div>
      </div>
    </div>
  );
}
