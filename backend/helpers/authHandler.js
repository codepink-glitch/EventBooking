exports.checkAuth = request => {
    if (!request.isAuth) {
        throw new Error("Unauthenticated.");
    }
}