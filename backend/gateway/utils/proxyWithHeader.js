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

            if (customOptions.proxyReqOptDecorator) {
                return customOptions.proxyReqOptDecorator(proxyReqOpts, srcReq);
            }

            return proxyReqOpts;
        }
    });
};
