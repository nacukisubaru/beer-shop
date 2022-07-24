export const setCookiesRefreshToken = (response, userData) => {
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    response.cookie('refreshToken', userData.refreshToken, {maxAge, httpOnly: true});
   // return response.json(userData);
}