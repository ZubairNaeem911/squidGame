import axios from "axios";
import { ENV } from "../config/config";
import { toast } from "react-toastify";
// let baseUrl = process.env.REACT_APP_SERVER_URL;
let baseUrl = process.env.REACT_APP_SERVER_URL;
// let ipfsUrl = process.env.REACT_APP_IPFS_URL;

async function apiHelper(apiType, path, data) {
    if (baseUrl === undefined || !baseUrl) {
        baseUrl = ""
    }
    // const xauthtoken = JSON.parse(localStorage.getItem("token"))
    if (apiType === "post" || apiType === "put" || apiType === "get" || apiType === "delete") {
        try {
            let response = await axios({
                method: apiType,
                url: `${baseUrl + path}`,
                data
                // headers: {
                //     'x-access-token': xauthtoken,
                //     'x-auth-token': ENV.x_auth_token
                // }
            })

            return response
        } catch (error) {
            let errorStatus = error.responce.status;
            if (errorStatus === 500 || errorStatus === 502 || errorStatus === 503 || errorStatus === 504) {
                // swal.fire({
                //     title: 'Server Error',
                //     text: "Oops Something Went Wrong, Try to refresh this page..",
                //     icon: 'warning',
                //     confirmButtonColor: '#3085d6',
                //     confirmButtonText: 'Ok'
                // })
            }
            // toast.error(error.response.data.message)
        }
    }
}

export default apiHelper