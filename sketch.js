let capture;
let poseNet;
let pose;
let skeleton;
var count = 0;
var colName = [
  "nose_x",
  "nose_y",
  "leftEye_x",
  "leftEye_y",
  "rightEye_x",
  "rightEye_y",
  "leftEar_x",
  "leftEar_y",
  "rightEar_x",
  "rightEar_y",
  "leftShoulder_x",
  "leftShoulder_y",
  "rightShoulder_x",
  "rightShoulder_y",
  "leftElbow_x",
  "leftElbow_y",
  "rightElbow_x",
  "rightElbow_y",
  "leftWrist_x",
  "leftWrist_y",
  "rightWrist_x",
  "rightWrist_y",
  "leftHip_x",
  "leftHip_y",
  "rightHip_x",
  "rightHip_y",
  "leftKnee_x",
  "leftKnee_y",
  "rightKnee_x",
  "rightKnee_y",
  "leftAnkle_x",
  "leftAnkle_y",
  "rightAnkle_x",
  "rightAnkle_y",
];
// csv 데이터 구축
var row = "";
for (let i = 0; i < colName.length; i++) {
  row += colName[i] + ",";
}
row += "\r\n";

// data[30][34] - 30번 반복, 34개의 관절 x, y 좌표
var data = new Array(30);
for (var i = 0; i < data.length; i++) {
  data[i] = new Array(34);
}

var start = new Audio("audio/start.mp3");
var end = new Audio("audio/end.mp3");

function setup() {
  createCanvas(800, 580);
  video = createCapture(VIDEO);
  video.size(800, 580);
  // 비디오 엘리먼트는 감추고 비디오 캔버스만 보여 준다.
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose; //감지된 첫번째 포즈의 포즈 데이터
    skeleton = poses[0].skeleton; //감지된 첫번째 뼈대 데이터
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  // 포즈 데이터 그리기
  if (pose) {
    // 모든 데이터를 for문을 돌려 화면에 표시한다.
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0, 255, 0);
      ellipse(x, y, 10, 10);
    }

    // 뼈대 라인을 그려 준다.  - skeleton
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0, 0, 255);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
}

function exec() {
  // 버튼 클릭 후 4초 후 데이터 저장
  setTimeout(repeat, 4000);
}

function repeat() {
  // 시작을 알림
  start.play();
  const btnElement = document.getElementById("info");
  // 0.4초마다 30번 반복
  var re = setInterval(function () {
    saveCoordinate();
    console.log(count + "번째 반복 중");
    if (count == 30) {
      // 종료를 알림
      end.play();
      btnElement.innerHTML = count + "개의 좌표가 저장 완료되었습니다.";
      clearInterval(re);
      count = 0;
      console.log(data);
      // 좌표 값 csv 파일에 넣기
      getCSV();
    }
  }, 400);
}

function saveCoordinate() {
  const btnElement = document.getElementById("info");
  btnElement.innerHTML = count + 1 + "개의 좌표 저장 중...";

  var col = 0;
  var score = 0;
  for (let i = 0; i < pose.keypoints.length; i++) {
    if (pose.keypoints[i].score < 0.1) {
      score = Math.round(pose.keypoints[i].score * 100);
      console.log(
        pose.keypoints[i].part + "의 정확도가 " + score + "%로 10% 미만입니다. "
      );
      // 방법 1) 다시 처음(코)부터 저장 시작 => 내 인터넷 문제인지 잘못하면 무한루프 돌아서 멈춰버림..
      // i = 0;

      // 방법 2) 정확도 낮은 지점부터 다시 저장 시작 => 무한루프
      // i--;
      // continue;

      // 방법 3) 그냥 빈칸으로 하고 다음 데이터로 넘어가기
      // break;

      // 방법 4) 그냥 측정 => 확인해보니까 정확도가 낮아도 비슷하게 측정됨
      // data[count][col++] = Math.round(pose.keypoints[i].position.x);
      // data[count][col++] = Math.round(pose.keypoints[i].position.y);
      // console.log(pose.keypoints[i].part + " 저장 성공");

      // 방법 5) 해당 값 0으로 두고 다음 좌표로 넘어가기 - 정확도 0.1 미만
      data[count][col++] = 0;
      data[count][col++] = 0;
      console.log(pose.keypoints[i].part + " 저장 성공");
    } else {
      data[count][col++] = Math.round(pose.keypoints[i].position.x);
      data[count][col++] = Math.round(pose.keypoints[i].position.y);
      console.log(pose.keypoints[i].part + " 저장 성공");
    }
  }
  count++;
}

// csv 파일로 저장할 때 열은 콤마(,)로 구분하고 행은 '\r\n'을 이용하여 구분
function getCSV() {
  for (let i = 0; i < data.length; i++) {
    row += data[i] + "\r\n";
  }
}

// csv 다운로드
function downloadCSV() {
  var downloadLink = document.createElement("a");
  var blob = new Blob([row], { type: "text/csv;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  downloadLink.href = url;
  downloadLink.download = "data.csv";

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  console.log("csv 파일을 다운로드했습니다.");
}

// 데이터 비우기
function clearData() {
  if (confirm("데이터를 비우시겠습니까?")) {
    // 확인 버튼 클릭 시 동작
    row = "";
    for (let i = 0; i < colName.length; i++) {
      row += colName[i] + ",";
    }
    row += "\r\n";
    alert("데이터가 삭제되었습니다.");
    const btnElement = document.getElementById("info");
    btnElement.innerHTML = "좌표가 아직 저장되지 않았습니다.";
  } else {
    // 취소 버튼 클릭 시 동작
    return;
  }
}
