import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            // Get user ID from the correct location
            const userId = srcReq.user?.userId ||    // From user object
                          srcReq.userId ||           // Direct property
                          srcReq.headers?.['x-user-id']; // From headers

            // Only set if we have a valid value
            if (userId && typeof userId === 'string' && userId.trim()) {
                proxyReqOpts.headers["x-user-id"] = userId;
            } else {
                // Remove the header to prevent undefined values
                delete proxyReqOpts.headers["x-user-id"];
                
                // Optional: log for debugging
                // console.log('No valid user ID found for request');
            }

            return proxyReqOpts;
        }
    });
};