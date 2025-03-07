import axios from "axios";
import jsCookie from "js-cookie";
// import Router from "@/router/index";
import errorHandle from "./response-error";
import { message, Modal } from "antd";
import { authLogin } from "../globals";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

declare module "axios" {
  interface AxiosResponse<T> {
    code: number;
    data: T;
  }
  export function create(config?: AxiosRequestConfig): AxiosInstance;
}

instance.interceptors.request.use(
  (config) => {
    console.log(jsCookie.get("authorization"));
    config.headers.authorization = "Bearer " + jsCookie.get("authorization");
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    console.log(response)
    if (response.data.code === 10003 || response.data.code === 10004) {
      /*  Router.push("/login"); */

      Modal.error({
        title: "提示",
        content: "您还未登录，请您登录后体验更多功能",
        okText: "重新登录",
        onOk: async () => {
          await authLogin({ password: "123456", username: "admin" });
          message.success("登录成功");
        },
      });
    }
    // 如果未登录，则直接退出登录。

    return response.status === 200 ? Promise.resolve(response.data) : Promise.reject(response);
  },
  (error) => {
    const { response } = error;
    errorHandle(response.status, response.info);
  }
);

export default instance;
