import axios from "axios";
import jsCookie from "js-cookie";
// import Router from "@/router/index";
import errorHandle from "./response-error";
import { message, Modal } from "antd";
import { authLogin, refreshTokenRequest } from "../globals";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

// 是否正在刷新的标记
let isRefreshing = false;
let requests = [];
let newToken = "";

declare module "axios" {
  interface AxiosResponse<T> {
    code: number;
    data: T;
  }
  export function create(config?: AxiosRequestConfig): AxiosInstance;
}

const NoLoginTip = () => {
  return new Promise<void>((resolve) => {
    Modal.error({
      title: "提示",
      content: "您还未登录，请您登录后体验更多功能",
      okText: "重新登录",
      onOk: async () => {
        await authLogin({ password: "123456", username: "admin" });
        message.success("登录成功");
        resolve();
      },
    });
  });
};

instance.interceptors.request.use(
  (config) => {
    if (config.url === "/auth/refresh-token") {
      config.headers.authorization = "Bearer " + jsCookie.get("refresh-token");
    } else {
      config.headers.authorization = "Bearer " + jsCookie.get("authorization");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  async (response) => {
    if (response.data.code === 10004) {
      /*  Router.push("/login"); */

      NoLoginTip();
    } else if (response.data.code === 10003) {
      if (!isRefreshing) {
        console.log("刷新token");
        isRefreshing = true;
        // 续签TOKEN
        return refreshTokenRequest()
          .then(() => {
            // 重新请求之前的请求
            requests.forEach((cb) => cb());
            requests = [];
            isRefreshing = false;  
            return instance(response.config);
          })
          .catch(() => {
            NoLoginTip();
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        console.log("加入队列");
        // 返回未执行 resolve 的 Promise
        return new Promise((resolve) => {
          // 用函数形式将 resolve 存入，等待刷新后再执行
          requests.push(() => {
            resolve(instance(response.config));
          });
        });
      }
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
