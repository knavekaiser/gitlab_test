const canvas = document.querySelector("#canvas"),
  width = canvas.clientWidth,
  height = canvas.clientHeight,
  colums = 10;
rows = 10;
ctx = canvas.getContext("2d");

const demo_img = document.querySelector("#demo-img");
colorArray = ["#481380", "#cc0e74", "#e6739f"];
nodes = [];
grids = [];
points = [];
pixels = [];

const mouse = {
  x: 0,
  y: 0,
};
let mouseOnCanvas = false;

let maxDist = 20;
for (var i = 0; i < 500; i++) {
  r = Math.floor(Math.random() * 5 + 1);
  nodes.push({
    r: r,
    minr: r,
    x: Math.round(Math.random() * (width - r * 2) + r),
    y: Math.round(Math.random() * (height - r * 2) + r),
    vx: Math.random() * 2 - 1,
    vy: Math.random() * 2 - 1,
    color: colorArray[Math.round(Math.random() * colorArray.length)],
  });
}
for (var i = 0; i < width; i += width / colums) {
  for (var j = 0; j < height; j += height / rows) {
    grids.push({
      x: i,
      y: j,
    });
  }
}

canvas.addEventListener("mouseenter", () => {
  mouseOnCanvas = true;
});
canvas.addEventListener("mouseleave", () => {
  mouseOnCanvas = false;
});
canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
});

drawImg(ctx, demo_img, "center", "bottom");
var imageData = ctx.getImageData(0, 0, width, height);

for (var i = 0; i < width; i++) {
  for (var j = 0; j < height; j++) {
    var index = (i * imageData.width + j) * 4,
      red = imageData.data[index],
      green = imageData.data[index + 1],
      blue = imageData.data[index + 2],
      alpha = imageData.data[index + 3] / 255;
    pixels.push({
      r: red,
      g: green,
      b: blue,
      a: alpha,
    });
  }
}

function getColorData(x, y, c) {
  pixel = pixels[Math.round(y) * Math.sqrt(pixels.length) + Math.round(x)];
  if (c === "color") {
    return pixel;
  } else if (c === "average") {
    if (pixel !== undefined) {
      return ((pixel.r + pixel.g + pixel.b) / (255 * 3)).toFixed(3);
    }
  }
}

function update() {
  ctx.clearRect(0, 0, width, height);
  // drawImg(ctx, demo_img, 'center', 'bottom')
  //lines
  for (var i = 0; i < nodes.length - 1; i++) {
    nodeA = nodes[i];
    for (var j = i + 1; j < nodes.length; j++) {
      nodeB = nodes[j];
      dx = nodeA.x - nodeB.x;
      dy = nodeA.y - nodeB.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist && nodeA.r > 0 && nodeB.r > 0) {
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.lineWidth = (maxDist / dist) * 0.09;
        ctx.stroke();
      }
    }
  }
  //collision
  for (var i = 0; i < nodes.length; i++) {
    node = nodes[i];
    if (mouseOnCanvas) {
      if (
        Math.abs(Math.round(node.x) - mouse.x) < 25 &&
        Math.abs(Math.round(node.y) - mouse.y) < 25
      ) {
        node.r < 30 ? node.r++ : false;
      } else {
        node.r > node.minr ? node.r-- : false;
      }
    } else {
      node.r > node.minr ? node.r-- : false;
    }
    node.x + node.r > width || node.x - node.r < 0
      ? (node.vx = -node.vx)
      : false;
    node.y + node.r > height || node.y - node.r < 0
      ? (node.vy = -node.vy)
      : false;
    node.x += node.vx;
    node.y += node.vy;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = node.color;
    ctx.stroke();
    ctx.lineWidth = 0.3;
    if (getColorData(node.x, node.y, "average") > 0.5) {
      node.r > 0 ? node.r-- : false;
      // nodes.splice(nodes.indexOf(node), 1)
    } else if (getColorData(node.x, node.y, "average") < 0.5) {
      node.r < node.minr ? node.r++ : false;
    }
  }
  //grid
  // for (var i = 0; i < grids.length; i++) {
  //   cell = grids[i];
  //   ctx.beginPath();
  //   ctx.fillStyle = 'rgba(255, 0,0,1)';
  //   ctx.fillRect(cell.x - 1, cell.y - 1, width / colums, .5);
  //   ctx.fillRect(cell.x - 1, cell.y - 1, .5, height / rows);
  // }
  requestAnimationFrame(update);
}

function drawImg(canvas, img, modeX, modeY) {
  aspectRatio = img.width / img.height;
  imgWidth = aspectRatio < 1 ? width : img.height / aspectRatio;
  imgHeight = aspectRatio < 1 ? imgWidth / aspectRatio : height;
  function fillmodeX(modeX) {
    if (aspectRatio < 1) {
      switch (modeX) {
        case "left":
          return 0;
          break;
        case "right":
          return 0;
          break;
        case "center":
          return 0;
          break;
        default:
          return 0;
      }
    } else if (aspectRatio > 1) {
      switch (modeX) {
        case "left":
          return 0;
          break;
        case "right":
          return (img.width - width) / 2;
          break;
        case "center":
          return (img.width - width) / 2 / 2;
          break;
        default:
          return 0;
      }
    }
  }
  function fillmodeY(modeY) {
    if (aspectRatio < 1) {
      switch (modeY) {
        case "bottom":
          return img.height - height * 2;
          break;
        case "top":
          return 0;
          break;
        case "center":
          return img.height / 2 - height;
          break;
        default:
          return 0;
      }
    } else if (aspectRatio > 1) {
      switch (modeY) {
        case "bottom":
          return 0;
          break;
        case "top":
          return 0;
          break;
        case "center":
          return 0;
          break;
        default:
          return 0;
      }
    }
  }
  canvas.drawImage(
    img,
    fillmodeX(modeX),
    fillmodeY(modeY),
    img.width,
    img.height,
    0,
    0,
    imgWidth,
    imgHeight
  );
}

update();

const img = document.querySelector("#img");

window.addEventListener("mousemove", (e) => {});
