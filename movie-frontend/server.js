const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const imageDir = path.join(__dirname, 'public', 'image');

function formatTitle(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function getImageFiles() {
  try {
    return fs.readdirSync(imageDir)
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
      .sort((a, b) => {
        if (a.toLowerCase().includes('wukong')) return -1;
        if (b.toLowerCase().includes('wukong')) return 1;
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
      });
  } catch (error) {
    console.error('Không thể đọc thư mục ảnh:', error);
    return [];
  }
}

const movies = getImageFiles().map((file, index) => {
  const name = path.parse(file).name;
  const title = formatTitle(name);
  const description = title.toLowerCase().includes('wukong')
    ? 'Đây là bộ phim thể loại thần thoại – hài hước xoay quanh thời niên thiếu của Ngộ Không thuở chưa trở thành Tề Thiên Đại Thánh.'
    : `Xem phim ${title} với hình ảnh từ thư mục image.`;

  return {
    id: index,
    title,
    image: `/image/${file}`,
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description
  };
});

app.get('/', (req, res) => {
  res.render('index', { movies });
});

app.get('/watch/:id', (req, res) => {
  const id = Number(req.params.id);
  const movie = movies[id];

  if (!movie) {
    return res.status(404).send('Phim không tìm thấy');
  }

  res.render('watch', { movie, id, movies });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});