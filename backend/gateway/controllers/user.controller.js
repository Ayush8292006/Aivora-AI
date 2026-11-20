export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "unauthorized" })
        }
        // Normalize _id so frontend components accessing userData._id or userData.userId work seamlessly
        const userObj = {
            ...req.user,
            _id: req.user.userId || req.user._id
        }
        return res.status(200).json(userObj)
    } catch (error) {
        return res.status(500).json({ success: false, message: `get current user error: ${error.message}` })
    }
}
