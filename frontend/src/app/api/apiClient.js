// import axios from "axios";
// import crypto from "crypto";
// // import { toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// const key = Buffer.from(process.env.NEXT_PUBLIC_APP_KEY, "hex"); 
// const iv = Buffer.from(process.env.NEXT_PUBLIC_APP_IV, "hex");   

// const axiosClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_APP_API_BASE_PATH,
//   headers: {
//     "api-key": process.env.NEXT_PUBLIC_APP_API_KEY_ENC,
//     "accept-language": process.env.NEXT_PUBLIC_APP_API_LANG,
//     "Content-Type": process.env.NEXT_PUBLIC_APP_API_CONT_TYPE
//   },
// });

// // Body Encryption Request
// axiosClient.interceptors.request.use(function (request) {
//   request.data = bodyEncryption(request.data, true);

//   const token = localStorage.getItem("token");
//   if (token) {
//     request.headers["token"] = token;
//   }
//   return request;
// });

// function bodyEncryption(data, isStringify = true) {
//   const jsonString = isStringify ? JSON.stringify(data) : data;

//   const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

//   let encrypted = cipher.update(jsonString, "utf8", "base64");
//   encrypted += cipher.final("base64");

//   return encrypted;
// }

// function bodyDecryption(encryptedData) {
//     const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  
//     let decrypted = decipher.update(encryptedData, "base64", "utf8");
//     decrypted += decipher.final("utf8");
//     return decrypted;
//   }

// axiosClient.interceptors.response.use(
//   function (response) {
//     const decrypted = bodyDecryption(response.data);
//     const parsedResponse = JSON.parse(decrypted);

//     if (parsedResponse?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("pageRefreshed");
//       return;
//     }
//     if (parsedResponse?.code === 0) {
//       // handle code 0
//     }

//     return parsedResponse;
//   },
//   function (error) {
//     if (error?.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("pageRefreshed");
//       window.location.reload();
//       return Promise.reject(error);
//     }

//     try {
//       const res = error.response;
//       const decryptedData = bodyDecryption(res?.data);
//       const respDecryptData = JSON.parse(decryptedData);

//       console.log(respDecryptData, "error");
//       return Promise.reject(respDecryptData);
//     } catch (e) {
//       console.error("Error decrypting error response", e);
//       return Promise.reject(error);
//     }
//   }
// );

// export { axiosClient };



import axios from "axios";
import { createCipheriv, createDecipheriv } from "crypto";

const IV_HEX = process.env.NEXT_PUBLIC_APP_IV;
const KEY_HEX = process.env.NEXT_PUBLIC_APP_KEY;

if (!IV_HEX || !KEY_HEX) {
  throw new Error('Missing encryption keys in environment variables (NEXT_PUBLIC_APP_IV or NEXT_PUBLIC_APP_KEY)');
}

const IV = Buffer.from(IV_HEX, 'hex');
const KEY = Buffer.from(KEY_HEX, 'hex');

if (IV.length !== 16) {
  throw new Error(`Invalid IV length: ${IV.length} bytes (must be 16 bytes for AES-256-CBC)`);
}

if (KEY.length !== 32) {
  throw new Error(`Invalid KEY length: ${KEY.length} bytes (must be 32 bytes for AES-256)`);
}

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_API_BASE_PATH,
  headers: {
    "api-key": process.env.NEXT_PUBLIC_APP_API_KEY_ENC,
    "accept-language": process.env.NEXT_PUBLIC_APP_API_LANG,
    "Content-Type": process.env.NEXT_PUBLIC_APP_API_CONT_TYPE
  },
});


function bodyEncryption(data, isStringify = true) {
  if (!data) return '';

  try {
    const jsonString = isStringify ? JSON.stringify(data) : String(data);

    const cipher = createCipheriv('aes-256-cbc', KEY, IV);
    let encrypted = cipher.update(jsonString, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (error) {
    console.error('Encryption Error:', error);
    return '';
  }
}


function bodyDecryption(encryptedData) {
  if (!encryptedData) return '{}';

  try {
    if (!isBase64(encryptedData)) {
      console.log("Not Base64, trying to parse as JSON:", encryptedData);
      return encryptedData;
    }

    const decipher = createDecipheriv('aes-256-cbc', KEY, IV);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption Error:', error);
    return '{}';
  }
}

function isBase64(str) {
  if (typeof str !== 'string') return false;
  
  const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  return base64Regex.test(str) && str.length % 4 === 0;
}

axiosClient.interceptors.request.use(function (request) {
  request.data = bodyEncryption(request?.data, true);
  console.log("Token in request header:", request.headers['token']);
  console.log("token in localStorage:", localStorage.getItem("token"));

   if (localStorage.getItem("token") !== undefined || localStorage.getItem("token") !== null) {
    request.headers['token'] = bodyEncryption(localStorage.getItem("token"), false)
    console.log("Token in request header after encryption:", request.headers['token']);
   
  }
  return request;
});

axiosClient.interceptors.response.use(
  function (response) {
    const decrypted = bodyDecryption(response?.data);
    try {
      const parsedResponse = JSON.parse(decrypted);
      console.log(parsedResponse, "response");

      if (parsedResponse?.status === 401) {
        // localStorage.removeItem("token");
        // localStorage.removeItem("pageRefreshed");
        return;
      }
      if (parsedResponse?.code === 0) {
  
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error parsing decrypted response:', error);
      return decrypted;
    }
  },
  function (error) {
    if (error?.response?.status === 401) {
      // localStorage.removeItem("token");
      // localStorage.removeItem("pageRefreshed");
      // window.location.reload();
      return Promise.reject(error);
    }

    try {
      const res = error.response;
      const decryptedData = bodyDecryption(res?.data);
      const respDecryptData = JSON.parse(decryptedData);

      console.log(respDecryptData, "error");
      return Promise.reject(respDecryptData);
    } catch (e) {
      console.error("Error decrypting error response", e);
      return Promise.reject(error);
    }
  }
);

export { axiosClient };