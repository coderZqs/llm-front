/**
 * 处理失败的方法
 * status: 状态码
 * ****  2xx ：成功
 *       3xx : 请求的资源重定向到其他网页
 *       4xx ： 客户端错误
 *       5xx ： 服务器内部错误
 * info: 失败的信息
 */
const errorHandle = (status, info) => {
  switch (status) {
    case 400:
      console.log("语义有误，当前去请求无法被服务器理解！");
      break;
    case 401:
      // token
      console.log("服务器认证错误！当前请求需要用户验证。");
      break;
    case 403:
      console.log("服务器已经理解请求，但拒绝执行！");
      break;
    case 404:
      console.log("请检查网络请求地址");
      break;
    case 500:
      console.log("服务器遇到了一个未曾预料的状况，导致它无法完成对请求的处理。");
      break;
    case 502:
      console.log("作为网关或者代理的服务器尝试请求时，从上游服务器接收到无效的响应");
      break;
    default:
      console.log(info);
      break;
  }
};

export default errorHandle;
