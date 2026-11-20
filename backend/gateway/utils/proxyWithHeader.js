import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl, customOptions = {}) => {
    return proxy(serviceUrl, {
        ...customOptions,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            // Get user ID strictly from the verified session (never trust client header)
            const userId = srcReq.user?.userId || srcReq.user?._id;

            if (userId) {
                proxyReqOpts.headers["x-user-id"] = String(userId);
            } else {
                delete proxyReqOpts.headers["x-user-id"];
            }

            if (srcReq.user?.role) {
                proxyReqOpts.headers["x-user-role"] = String(srcReq.user.role);
            }

            if (srcReq.user?.email) {
                proxyReqOpts.headers["x-user-email"] = String(srcReq.user.email);
            }

            if (srcReq.user?.isGuest) {
                proxyReqOpts.headers["x-guest-session-id"] = String(userId);
            } else if (srcReq.headers["x-guest-session-id"] || srcReq.cookies?.guestSessionId) {
                proxyReqOpts.headers["x-guest-session-id"] = String(srcReq.headers["x-guest-session-id"] || srcReq.cookies?.guestSessionId);
            }

            if (customOptions.proxyReqOptDecorator) {
                return customOptions.proxyReqOptDecorator(proxyReqOpts, srcReq);
            }

            return proxyReqOpts;
        }
    });
};
