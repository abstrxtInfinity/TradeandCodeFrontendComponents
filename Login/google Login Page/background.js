var drawEveryFrame = 1;
var frame = 0;
var lineWidthStart = 3.5;
var circlesMargin = 15;

const Point = class Point {
    constructor(x, y, lifetime) {
        this.x = x;
        this.y = y;
        this.lifetime = lifetime;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    static midPoint(a, b) {
        const mx = a.x + (b.x - a.x) * 0.5;
        const my = a.y + (b.y - a.y) * 0.5;

        return new Point(mx, my);
    }

    static angle(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.atan2(dy, dx);
    }

    get pos() {
        return this.x + "," + this.y;
    }
}
const Dots = class Dots {

    constructor(canvasElement, width, height) {
        const that = this;

        that.canvas = canvasElement;
        that.canvas.width = width;
        that.canvas.height = height;
        that.ctx = that.canvas.getContext('2d');

        that.circles = [];
        that.points = [];

        const grd_active = that.ctx.createLinearGradient(0, 0, that.canvas.width, 0);
        grd_active.addColorStop(0, "#0092ff");
        grd_active.addColorStop(0.5, "#00ffae");
        grd_active.addColorStop(1, '#e5fe48');

        const grd = that.ctx.createLinearGradient(0, 0, that.canvas.width, 0);
        grd.addColorStop(0, "#204868");
        grd.addColorStop(0.5, "#256456");
        grd.addColorStop(1, '#5a643d');

        that.grd_active = grd_active;
        that.grd = grd;

        for (let i = 0; i < Math.round(that.canvas.width / circlesMargin * 1.5); i++) {
            for (let j = 0; j < Math.round(that.canvas.height / circlesMargin * 1.5); j++) {
                that.circles.push({
                    x: 13 + (circlesMargin) * i * 0.8,
                    y: 10 + (circlesMargin - 0.25) * j * 0.8,
                    r: 0.5,
                    animation: false
                })
            }
        }

        that.draw();
        that.canvas.addEventListener('mousemove', function (e) {
            if (frame === drawEveryFrame) {
                that.addPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
                frame = 0;
            }
            frame++;
        })

        that.canvas.addEventListener('touchmove', function (e) {
            if (frame === drawEveryFrame) {
                that.addPoint(
                    e.changedTouches[0].pageX - this.offsetLeft,
                    e.changedTouches[0].pageY - this.offsetTop
                );
                frame = 0;
            }
            frame++;
        })

        window.addEventListener('resize', function (e) {
            that.redrawForResize();
        })
    }

    redrawForResize() {
        const that = this;

        that.canvas.width = window.innerWidth;
        that.canvas.height = window.innerHeight;

        that.circles = [];
        that.points = [];

        for (let i = 0; i < Math.round(that.canvas.width / circlesMargin * 1.5); i++) {
            for (let j = 0; j < Math.round(that.canvas.height / circlesMargin * 1.5); j++) {
                that.circles.push({
                    x: 13 + (circlesMargin) * i * 0.8,
                    y: 10 + (circlesMargin - 0.25) * j * 0.8,
                    r: 0.5,
                    animation: false
                })
            }
        }
    }

    draw() {
        const that = this;

        requestAnimationFrame(function () {
            that.draw();
        });
        that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);

        that.circles.forEach(function (circle, i) {
            that.ctx.beginPath();
            that.ctx.arc(circle.x, circle.y + 1.5, circle.r, 0, 2 * Math.PI, true);

            if (circle.animation) {
                that.ctx.fillStyle = that.grd_active;
            } else {
                that.ctx.fillStyle = that.grd;
            }

            that.ctx.fill();
        })

        that.animatePoints();
    }

    animatePoints(circle) {
        var duration = 2 * 1000 / 60;
        var point, lastPoint;
        const that = this;

        for (let i = 0; i < that.points.length; i++) {
            point = that.points[i];

            if (that.points[i - 1] !== undefined) {
                lastPoint = that.points[i - 1];
            } else {
                lastPoint = that.points[i];
            }

            point.lifetime += 1;

            if (point.lifetime > duration) {
                that.points.splice(i, 1);
                continue;
            }

            var inc = (point.lifetime / duration);
            var dec = 1 - inc;

            var spreadRate;
            spreadRate = lineWidthStart * (1 - inc);

            var fadeRate = dec;

            that.ctx.lineJoin = "round";
            that.ctx.lineWidth = spreadRate;

            var distance = Point.distance(lastPoint, point);
            var midpoint = Point.midPoint(lastPoint, point);
            var angle = Point.angle(lastPoint, point);

            that.circles.forEach(function (circle) {

                if (circle.spreadRate && spreadRate == circle.spreadRate) {
                    circle.r = 0.8;
                    circle.animation = false;
                }

                that.drawCircles(point.x, point.y, circle, spreadRate);
                that.drawCircles(midpoint.x, midpoint.y, circle, spreadRate);
                that.drawCircles((point.x + midpoint.x) / 2, (point.y + midpoint.y) / 2, circle, spreadRate);
                that.drawCircles(lastPoint.x, lastPoint.y, circle, spreadRate);
                that.drawCircles((lastPoint.x + midpoint.x) / 2, (lastPoint.y + midpoint.y) / 2, circle, spreadRate);
            })
        }
    }

    drawCircles(x, y, circle, spreadRate) {
        const dist = Math.round(Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)));

        if (dist < 8) {

            if (Math.floor(spreadRate))
                circle.animation = true;
            else
                circle.animation = false;

            circle.spreadRate = spreadRate;

            spreadRate >= 0.8 ? (circle.r = spreadRate) : (circle.r = 0.8);
        }
    }

    addPoint(x, y) {
        const point = new Point(x, y, 0);
        this.points.push(point);
    }
}

new Dots(document.querySelector('#animation-dots'), window.innerWidth, window.innerHeight);

const canvas = document.querySelector('#animation-pattern');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const blueCircle = {
    x: -10,
    y: -10,
    r: 0
}, yellowCircle = {
    x: -10,
    y: -10,
    r: 0
};
var animationCount = 0;

var grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
grd.addColorStop(0, "#204868");
grd.addColorStop(0.5, "#256456");
grd.addColorStop(1, '#5a643d');

window.addEventListener('resize', function (e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

var back_pattern = new Image();
back_pattern.src = 'https://image.ibb.co/iUDfBK/pattern.png';
back_pattern.onload = function () {
    drawPattern();
};

var paths = [
    ['M 500.20 50.43 C 501.27 49.43 502.17 47.88 503.86 48.09 C 503.96 49.18 503.57 50.05 502.69 50.70 C 487.29 66.01 471.93 81.35 456.63 96.77 C 432.12 96.83 407.61 96.64 383.11 96.86 C 352.89 126.69 323.00 156.89 292.92 186.88 C 291.15 188.38 289.66 191.03 287.02 190.75 C 263.71 190.69 240.41 190.76 217.11 190.71 C 215.91 190.58 215.17 191.69 214.38 192.37 C 184.56 222.17 154.65 251.87 124.77 281.60 C 123.39 282.87 122.06 284.80 119.96 284.66 C 96.35 284.68 72.74 284.68 49.14 284.66 C 47.91 284.53 47.17 285.71 46.35 286.40 C 32.17 300.56 17.91 314.62 3.68 328.72 C 2.54 329.88 1.26 330.89 0.00 331.92 L 0.00 329.60 C 15.52 314.57 30.76 299.27 46.13 284.09 C 46.88 283.24 47.83 282.86 48.96 282.95 C 72.92 282.92 96.87 283.01 120.82 282.91 C 151.56 252.30 182.40 221.78 213.08 191.10 C 214.15 190.09 215.22 188.66 216.91 188.99 C 240.62 188.98 264.33 189.07 288.04 188.94 C 291.30 186.26 294.05 182.97 297.14 180.06 C 325.47 151.70 353.88 123.42 382.14 95.00 C 406.68 94.98 431.22 95.05 455.76 94.96 C 470.50 80.05 485.43 65.31 500.20 50.43 Z'],
    ['M 923.84 190.31 C 926.52 191.49 928.18 194.02 930.29 195.93 C 943.80 209.28 957.05 222.93 970.69 236.13 C 995.10 236.55 1019.57 236.15 1044.01 236.32 C 1045.52 236.12 1046.63 237.35 1047.66 238.28 C 1077.85 268.80 1108.12 299.29 1138.50 329.61 C 1144.81 330.50 1151.50 329.75 1157.96 330.00 C 1176.52 330.03 1195.08 329.95 1213.65 330.03 C 1243.39 360.68 1273.80 390.71 1303.87 421.06 C 1305.16 422.62 1307.87 423.84 1307.12 426.31 C 1302.25 422.81 1298.52 417.93 1294.12 413.88 C 1266.81 386.61 1239.74 359.05 1212.32 331.91 C 1187.59 331.46 1162.81 332.03 1138.08 331.63 C 1126.19 320.30 1114.82 308.38 1103.14 296.82 C 1083.67 277.24 1064.13 257.74 1044.75 238.08 C 1020.15 238.02 995.54 238.07 970.93 238.05 C 969.44 238.27 968.55 236.92 967.63 236.05 C 953.08 221.21 938.06 206.80 923.68 191.81 L 923.84 190.31 Z'],
    ['M 36.70 425.59 C 38.82 425.52 40.06 427.33 41.44 428.60 C 70.53 457.82 99.78 486.88 128.86 516.11 C 129.79 516.83 130.55 518.24 131.94 517.97 C 156.27 518.03 180.60 518.00 204.93 517.99 C 213.85 526.03 222.01 534.90 230.63 543.29 C 253.47 566.19 276.44 588.97 299.21 611.95 C 323.81 612.10 348.43 611.89 373.03 612.05 C 403.65 643.03 434.75 673.55 465.59 704.32 C 466.54 705.22 467.55 706.38 469.03 706.20 C 493.22 706.25 517.40 706.23 541.59 706.21 C 555.35 719.87 569.16 733.48 582.89 747.15 C 585.15 749.43 587.65 751.52 589.44 754.22 C 588.89 754.15 587.79 754.02 587.24 753.95 C 571.70 738.79 556.45 723.30 540.81 708.25 C 528.89 707.68 516.90 708.16 504.96 708.00 C 492.30 708.15 479.63 707.67 467.00 708.28 C 435.25 676.85 403.59 645.33 372.02 613.74 C 347.41 613.68 322.81 613.81 298.20 613.67 C 267.56 582.69 236.58 552.05 205.84 521.16 C 204.46 519.31 202.03 519.75 200.03 519.70 C 176.75 519.92 153.46 519.40 130.19 519.96 C 99.80 489.64 69.50 459.24 39.10 428.93 C 38.12 427.94 37.32 426.83 36.70 425.59 Z'],
    ['M 923.64 471.95 C 925.32 471.91 926.23 473.62 927.40 474.58 C 941.83 489.08 956.34 503.50 970.78 517.99 C 995.78 518.01 1020.79 517.99 1045.80 518.00 C 1050.25 523.53 1055.72 528.18 1060.58 533.36 C 1086.72 559.62 1112.72 586.07 1139.08 612.09 C 1163.95 612.54 1188.90 612.06 1213.80 612.33 C 1241.41 640.03 1269.25 667.51 1296.92 695.16 C 1300.65 698.68 1304.02 702.61 1307.95 705.90 C 1332.58 706.03 1357.21 705.88 1381.85 705.98 C 1396.96 721.25 1412.20 736.40 1427.41 751.57 C 1428.28 752.32 1430.71 754.61 1428.36 755.09 C 1414.19 741.08 1400.18 726.93 1386.07 712.88 C 1384.21 711.18 1382.70 709.04 1380.55 707.73 C 1355.63 707.60 1330.69 707.75 1305.77 707.66 C 1304.70 704.79 1302.08 703.06 1300.08 700.91 C 1271.12 671.91 1241.89 643.17 1212.94 614.15 C 1188.01 613.81 1163.07 614.08 1138.14 614.01 C 1108.93 584.51 1079.54 555.19 1050.31 525.71 C 1048.20 523.79 1046.49 521.42 1044.16 519.79 C 1019.52 519.71 994.86 519.89 970.22 519.71 C 964.06 514.27 958.52 508.11 952.60 502.39 C 943.08 492.78 933.36 483.34 923.96 473.62 L 923.64 471.95 Z'],
    ['M 205.30 142.73 L 206.59 142.83 C 230.73 166.88 254.79 191.01 278.90 215.09 C 285.95 221.99 292.72 229.22 299.94 235.92 C 324.64 236.12 349.35 235.92 374.05 236.02 C 382.34 243.63 390.01 252.02 398.07 259.93 C 421.25 283.44 444.78 306.61 467.83 330.23 C 492.60 330.32 517.37 330.21 542.14 330.29 C 544.13 333.13 546.80 335.38 549.20 337.86 C 576.70 365.35 604.19 392.86 631.71 420.34 C 632.93 421.74 634.97 422.81 634.98 424.91 C 632.80 425.09 631.74 422.89 630.31 421.67 C 602.49 393.82 574.64 366.01 546.81 338.17 C 544.82 336.20 542.77 334.27 541.08 332.03 C 516.11 331.96 491.13 332.02 466.16 332.00 C 465.78 329.95 463.95 328.79 462.61 327.40 C 433.86 298.51 405.04 269.67 376.35 240.71 C 375.02 239.55 373.91 237.54 371.89 237.74 C 350.58 237.74 329.27 237.74 307.96 237.74 C 305.05 237.74 302.12 237.59 299.22 238.00 C 267.78 206.54 236.26 175.15 204.89 143.62 L 205.30 142.73 Z'],
    ['M 1390.45 377.23 C 1391.97 376.41 1392.33 378.46 1391.22 379.15 C 1361.67 408.61 1332.21 438.16 1302.68 467.64 C 1300.79 469.35 1299.28 471.53 1297.10 472.87 C 1272.45 472.64 1247.76 472.62 1223.12 472.87 C 1194.88 500.77 1167.02 529.10 1139.01 557.25 C 1135.67 560.32 1132.88 564.05 1129.19 566.68 C 1105.46 566.78 1081.73 566.73 1058.00 566.69 C 1056.81 566.79 1055.40 566.39 1054.48 567.34 C 1023.48 598.21 992.67 629.29 961.60 660.08 L 959.71 660.19 C 963.64 654.75 969.05 650.53 973.61 645.60 C 1000.45 618.72 1027.38 591.93 1054.16 564.99 C 1079.01 565.00 1103.86 565.00 1128.71 564.99 C 1159.77 533.49 1191.20 502.35 1222.24 470.84 C 1247.07 471.18 1271.91 470.93 1296.75 470.97 C 1327.91 439.66 1359.21 408.47 1390.45 377.23 Z'],
    ['M 548.06 379.11 C 549.14 378.13 550.34 377.32 551.68 376.69 C 549.85 381.20 545.49 383.86 542.38 387.41 C 513.88 415.96 485.30 444.42 456.85 473.00 C 432.32 473.02 407.79 472.97 383.26 473.03 C 353.82 502.32 324.32 531.55 294.93 560.89 C 292.90 562.78 291.19 565.08 288.85 566.59 C 264.30 567.07 239.69 566.37 215.14 566.93 C 209.10 572.26 203.68 578.29 197.86 583.88 C 172.41 609.17 147.06 634.59 121.50 659.77 C 116.77 661.83 111.05 660.17 105.94 660.68 C 87.26 660.69 68.58 660.70 49.90 660.67 C 46.87 660.37 45.17 663.38 43.14 665.11 C 28.71 679.22 14.52 693.59 0.00 707.61 L 0.00 705.24 C 15.39 689.75 31.13 674.59 46.43 659.01 C 70.87 658.85 95.31 659.01 119.76 658.93 C 151.26 627.58 182.89 596.35 214.25 564.86 C 238.89 565.18 263.54 564.91 288.18 565.00 C 319.57 533.86 350.74 502.47 382.29 471.49 C 406.42 470.91 430.72 471.49 454.92 471.22 C 457.41 470.76 458.76 468.09 460.64 466.58 C 489.75 437.40 518.95 408.29 548.06 379.11 Z'],
    ['M 923.64 471.95 C 925.32 471.91 926.23 473.62 927.40 474.58 C 941.83 489.08 956.34 503.50 970.78 517.99 C 995.78 518.01 1020.79 517.99 1045.80 518.00 C 1050.25 523.53 1055.72 528.18 1060.58 533.36 C 1086.72 559.62 1112.72 586.07 1139.08 612.09 C 1163.95 612.54 1188.90 612.06 1213.80 612.33 C 1241.41 640.03 1269.25 667.51 1296.92 695.16 C 1300.65 698.68 1304.02 702.61 1307.95 705.90 C 1332.58 706.03 1357.21 705.88 1381.85 705.98 C 1396.96 721.25 1412.20 736.40 1427.41 751.57 C 1428.28 752.32 1430.71 754.61 1428.36 755.09 C 1414.19 741.08 1400.18 726.93 1386.07 712.88 C 1384.21 711.18 1382.70 709.04 1380.55 707.73 C 1355.63 707.60 1330.69 707.75 1305.77 707.66 C 1304.70 704.79 1302.08 703.06 1300.08 700.91 C 1271.12 671.91 1241.89 643.17 1212.94 614.15 C 1188.01 613.81 1163.07 614.08 1138.14 614.01 C 1108.93 584.51 1079.54 555.19 1050.31 525.71 C 1048.20 523.79 1046.49 521.42 1044.16 519.79 C 1019.52 519.71 994.86 519.89 970.22 519.71 C 964.06 514.27 958.52 508.11 952.60 502.39 C 943.08 492.78 933.36 483.34 923.96 473.62 L 923.64 471.95 Z'],
    ['M 36.59 236.79 L 38.58 236.96 C 69.73 267.67 100.45 298.85 131.52 329.66 C 132.41 330.60 133.85 330.16 134.99 330.31 C 158.58 330.07 182.20 330.61 205.79 330.03 C 228.69 352.85 251.51 375.74 274.38 398.59 C 282.94 406.98 291.20 415.72 299.94 423.91 C 324.48 424.12 349.02 423.93 373.57 424.00 C 402.19 453.17 431.33 481.83 460.15 510.81 C 462.27 513.38 465.82 515.16 466.44 518.66 C 465.17 518.19 464.07 517.47 463.14 516.51 C 434.24 487.53 405.24 458.64 376.33 429.66 C 374.48 427.98 372.87 425.20 369.96 425.71 C 347.64 425.76 325.33 425.68 303.01 425.76 C 301.57 425.62 299.99 426.02 298.65 425.39 C 267.40 394.38 236.48 363.01 205.14 332.11 C 180.76 331.85 156.37 332.10 131.99 331.98 C 130.74 331.82 129.99 330.63 129.08 329.90 C 100.62 301.37 72.09 272.91 43.61 244.40 C 41.20 241.93 38.52 239.68 36.59 236.79 Z'],
    ['M 1044.34 425.57 C 1044.77 425.17 1045.21 424.77 1045.67 424.37 C 1076.92 455.52 1108.15 486.69 1139.28 517.97 C 1164.15 518.04 1189.02 517.98 1213.89 518.00 C 1244.90 549.38 1276.25 580.44 1307.21 611.88 C 1332.15 612.04 1357.11 611.89 1382.06 611.96 L 1381.99 613.53 C 1356.79 614.05 1331.52 613.30 1306.31 613.91 C 1293.85 600.65 1280.71 588.00 1267.98 574.99 C 1251.34 558.27 1234.69 541.56 1218.04 524.86 C 1216.12 523.24 1214.73 520.84 1212.45 519.77 C 1188.29 519.72 1164.13 519.76 1139.98 519.75 C 1138.33 520.04 1137.31 518.64 1136.30 517.66 C 1105.70 486.92 1074.86 456.40 1044.34 425.57 Z'],
];

function generateElectroCircle(count) {
    var currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    currentPath.setAttributeNS(null, "fill", "none");
    currentPath.setAttributeNS(null, "d", paths[count][0]);
    currentPath.setAttributeNS(null, "color", "blue");

    var path = currentPath;
    var pathLength = Math.floor(path.getTotalLength());

    var percent = { value: 0 };

    new TWEEN.Tween(percent).to({ value: 50 }, 3000).onUpdate(function () {
        moveObj(path, percent.value, pathLength);
    }).onComplete(function () {
        blueCircle.x = -10;
        blueCircle.y = -10;
        yellowCircle.x = -10;
        yellowCircle.y = -10;

        setTimeout(function () {
            if (count + 1 === document.querySelectorAll('path[color]').length)
                generateElectroCircle(0);
            else
                generateElectroCircle(count + 1);
        }, 2000)
    }).start();
}

generateElectroCircle(animationCount);

function moveObj(path, prcnt, pathLength) {
    prcnt = (prcnt * pathLength) / 100;

    pt = path.getPointAtLength(prcnt);
    pt.x = Math.round(pt.x);
    pt.y = Math.round(pt.y);

    if (path.getAttribute('color') == 'blue') {
        blueCircle.x = pt.x;
        blueCircle.y = pt.y;
    } else {
        yellowCircle.x = pt.x;
        yellowCircle.y = pt.y;
    }
}

function drawPattern() {
    requestAnimationFrame(drawPattern);

    TWEEN.update();

    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();

    var pattern = ctx.createPattern(back_pattern, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var grd_active = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grd_active.addColorStop(0, "#0092ff");
    grd_active.addColorStop(0.5, "#00ffae");
    grd_active.addColorStop(1, '#e5fe48');

    ctx.beginPath();
    ctx.fillStyle = grd_active;
    ctx.arc(blueCircle.x, blueCircle.y, 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.arc(yellowCircle.x, yellowCircle.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}
