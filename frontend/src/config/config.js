// require('dotenv').config();

export const ENV = {
    // serverUrl: process.env.REACT_APP_SERVER_URL,
    // liveServerUrl: process.env.REACT_APP_LIVE_SERVER_URL,
    // socket: '',//io.connect("http://localhost:5000"),
    // Authorization: `Bearer ${process.env.REACT_APP_AUTHORIZATION}`,
    // x_access_token: JSON.parse(localStorage.getItem("userToken")),
    // x_auth_token: process.env.REACT_APP_X_AUTH_TOKEN,
    // media_url: process.env.REACT_APP_MEDIA_URL,
    saveItem: function (name, value) {
        localStorage.setItem(`${name}`, JSON.stringify(value));
    },
    removeItem: function (name) {
        localStorage.removeItem(name);
    },
    // encryptUserData: function (data, token) {
    //     if (data) {
    //         localStorage.setItem('userInfo', JSON.stringify(data));
    //     }
    //     if (token) {
    //         localStorage.setItem('uToken', JSON.stringify(token));
    //     }
    //     return true;
    // },
    getItem: function (keys = null) {
        let userData = localStorage.getItem(keys);
        return userData;
    },
    // getToken: function () {
    //     let userData = localStorage.getItem('uToken');
    //     if (userData) {
    //         return userData;
    //     }
    //     return {};
    // },
    // getHeaders: function () {
    //     let token = JSON.parse(localStorage.getItem('uToken'));
    //     let headers = {
    //         Accept: "application/json",
    //         "Content-Type": "application/json",
    //         "Access-Control-Allow-Origin": "*",
    //     };
    //     if (token) {
    //         headers["Authorization"] = "Bearer " + token;
    //         headers["access-token"] = token;
    //     }
    //     return headers;
    // },
    logout: function () {
        // localStorage.removeItem('uToken');
        // localStorage.removeItem('userInfo');
        localStorage.removeItem('WalletAddress')
    }
}