var token = localStorage.getItem('token')
var address = localStorage.getItem('address1')
const video = document.getElementById('video')




Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/weights'),
    faceapi.nets.ageGenderNet.loadFromUri('/weights'),
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
      { video: {} },
      (stream) => (video.srcObject = stream),
      (err) => alert("您还未接入摄像头")
    );
  }
  //线程睡眠
  function sleep(numberMillis){
    var now = new Date(); 
    var exitTime = now.getTime() + numberMillis; 
    while (true) { 
        now = new Date(); 
        if (now.getTime() > exitTime) 
        return;
    }
}
  
video.addEventListener("play", () => {
    var i =0;
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      if(detections.length>0){
            console.log(detections)
              //检测到人头，调用api
              var canvas1 = document.getElementById('canvas');
              canvas1.getContext("2d").drawImage(video,0,0,401,401);
              var Data1 = canvas1.toDataURL('image/png');
              //调用后端接口
              i++;
              $.ajax({
                  beforeSend: function(request){
                    if(token==null){
                        alert("请先登录！")
                        window.location.href = 'loginVideo.html'
                    }
                    request.setRequestHeader("token",token)
                },
                type:'get',
                url:'http://localhost:8009/face/getWeather',
                contentType:"application/json;charset=utf-8",
                success: function(res){
                  var data = res.data.data;
                  data=JSON.parse(data);
                  console.log(data)
                  var f1 = data.showapi_res_body.f1
                  console.log(f1.weekday)
                  console.log(f1.day_weather)
                  console.log(f1.night_weather)
                  var weekday = f1.weekday
                  var weather = f1.day_weather
                  console.log(Data1)
                  var str = JSON.stringify({"base64":Data1,"address":address,"weekday":weekday,"weather":weather})
                  getFace(str)
                }
              })
              function getFace(str){
                $.ajax(
                  { 
                    beforeSend: function(request){
                      if(token==null){
                          alert("请先登录！")
                          window.location.href = 'loginVideo.html'
                      }
                      request.setRequestHeader("token",token)
                  },
                    type:"post", 
                    url:"http://localhost:8009/face/catchFaceInfo",
                    data:str,
                    contentType:"application/json;charset=utf-8",
                    success: function(res){ 
                      if(res.data.list.length){
                      var l = res.data.list.length
                      for(var i =0;i<l;i++){
                        console.log("年龄为:"+res.data.list[i].age)
                        if(res.data.list[i].gender==0){
                          console.log("性别为:男")
                        }else{
                          console.log("性别为:女")
                        }
                      }
                    }
                    } 
                  });
              }
              
              sleep(5000)
      }
    }, 100);
  });