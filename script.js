let player;
let obstacles;
let score = 0;
let scoreText;
let startButton;
let cursors;
let isGameStarted = false;

const config = {
  type: Phaser.AUTO,
  width: 1200,  // Kích thước màn hình mới
  height: 500,  // Kích thước màn hình mới
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'ai-generated-8886225.jpg');
  this.load.image('player', 'talking_blush.png'); // Đổi thành hình ảnh mới
  this.load.image('obstacle', 'Icons-Land-Weather-Ice.256.png');
  this.load.audio('bgMusic', '768553__josefpres__piano-loops-157-efect-3-octave-long-loop-120-bpm.wav');
}

function create() {
  // Hiển thị hình nền
  this.add.image(600, 250, 'background'); // Điều chỉnh vị trí hình nền cho phù hợp với kích thước màn hình mới

  // Tạo nút Start ở chính giữa màn hình
  startButton = this.add.text(520, 200, 'Start Game', { 
    fontSize: '40px', 
    fill: '#fff', 
    fontStyle: 'bold' // Chữ đậm hơn
  })
    .setInteractive()
    .on('pointerdown', startGame, this);

  // Hiển thị hướng dẫn chơi ở góc
  const instructionBox = this.add.rectangle(950, 80, 250, 200, 0x000000, 0.7);
  this.add.text(880, 30, 'How to Play:', { fontSize: '20px', fill: '#fff' });
  this.add.text(880, 60, 'Use LEFT and RIGHT arrow keys to move.', { fontSize: '18px', fill: '#fff' });
  this.add.text(880, 90, 'Avoid falling ice blocks.', { fontSize: '18px', fill: '#fff' });

  // Khởi tạo phím điều khiển sau khi bấm start
  cursors = this.input.keyboard.createCursorKeys();
}

function startGame() {
  // Đặt flag cho trò chơi đã bắt đầu
  isGameStarted = true;

  // Ẩn nút Start
  startButton.setVisible(false);

  // Khởi tạo nhân vật và các yếu tố game sau khi bấm start
  player = this.physics.add.sprite(100, 400, 'player').setScale(0.2); // Nhân vật nhỏ hơn
  player.setCollideWorldBounds(true); // Ngăn nhân vật đi ra ngoài màn hình

  // Nền tảng cố định
  const ground = this.add.rectangle(600, 480, 1200, 20, 0x228b22); // Màu xanh lá
  this.physics.add.existing(ground, true);
  this.physics.add.collider(player, ground); // Kiểm tra va chạm giữa nhân vật và nền

  // Nhóm chướng ngại vật
  obstacles = this.physics.add.group();
  this.physics.add.collider(player, obstacles, gameOver, null, this); // Kiểm tra va chạm giữa nhân vật và chướng ngại vật

  // Điểm số
  scoreText = this.add.text(10, 10, 'Score: 0', { 
    fontSize: '30px', 
    fill: '#fff', 
    fontStyle: 'bold' 
  });

  // Tạo chướng ngại vật định kỳ
  this.time.addEvent({
    delay: 1500,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true,
  });

  // Phát nhạc nền
  const bgMusic = this.sound.add('bgMusic', { loop: true });
  bgMusic.play();
}

function spawnObstacle() {
  // Tạo khối băng ngẫu nhiên từ trên xuống
  const obstacleX = Phaser.Math.Between(100, 1100); // Xác định vị trí xuất phát
  const obstacle = obstacles.create(obstacleX, 0, 'obstacle').setScale(0.2); // Khối băng nhỏ hơn
  obstacle.setVelocityY(300); // Khối băng rơi xuống
  obstacle.setImmovable(true); // Chướng ngại vật không di chuyển

  // Kiểm tra va chạm với nhân vật
  this.physics.add.collider(player, obstacle, gameOver, null, this);
}

function update() {
  if (!isGameStarted) return; // Nếu chưa bắt đầu trò chơi thì không làm gì

  // Di chuyển nhân vật sang trái và phải
  const moveSpeed = 600; // Tăng tốc độ di chuyển lên
  if (cursors.left.isDown) {
    player.setVelocityX(-moveSpeed); // Di chuyển sang trái
  } else if (cursors.right.isDown) {
    player.setVelocityX(moveSpeed); // Di chuyển sang phải
  } else {
    player.setVelocityX(0); // Dừng di chuyển nếu không ấn phím
  }

  // Kiểm tra điểm số: Nếu băng rơi ra khỏi màn hình và không va vào nhân vật
  obstacles.children.iterate(function (obstacle) {
    if (obstacle.y > 500) {  // Nếu băng rơi ra ngoài màn hình (y > 500)
      obstacle.destroy(); // Xóa chướng ngại vật
      score++; // Tăng điểm
      scoreText.setText('Score: ' + score); // Cập nhật điểm số
    }
  });

  // Kiểm tra nếu nhân vật rơi ra khỏi màn hình
  if (player.y > 500) {
    gameOver();
  }
}

function gameOver() {
  this.physics.pause(); // Dừng tất cả vật lý
  player.setTint(0xff0000); // Đổi màu nhân vật
  this.add.text(500, 200, 'Game Over', { fontSize: '40px', fill: '#000' });
}
