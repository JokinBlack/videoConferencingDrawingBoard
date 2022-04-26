/**
 * 
 * @param constraints 获取设备的种类值
 * @param success 
 * @param error 
 * 兼容打开浏览器对话，询问用户获取设备权限
 */
 export const getUserMedia = (constraints, success, error) => {
    if (navigator.mediaDevices.getUserMedia) {
        //最新的标准API
        if(constraints.video != false){
            if(constraints.video == true){
                constraints.video = {}
            }
            constraints.video.width = { ideal: 1920 }
            constraints.video.height = { ideal: 1080 }
        }
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    } else if (navigator.webkitGetUserMedia) {
        //webkit核心浏览器
        navigator.webkitGetUserMedia(constraints, success, error)
    } else if (navigator.mozGetUserMedia) {
        //firfox浏览器
        navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
        //旧版API
        navigator.getUserMedia(constraints, success, error);
    }
}