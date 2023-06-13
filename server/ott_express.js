import express from "express";
import mysql from "mysql";
import bp from 'body-parser';
import cors from "cors";

const app = express();
const port = 3010;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '7624',
  database: 'mydb'
});

db.connect();

app.use(cors());
app.use(bp.json());

app.get('/', (req, res) => {
  res.json({ result: "success" });
});

app.get('/video', (req, res) => {
  const sql = 'SELECT v.v_id, v.v_title, v.v_type, v.v_genre, v.v_country, o.o_id, o.o_name FROM video v LEFT JOIN ott_has_video ov ON v.v_id = ov.video_v_id LEFT JOIN ott o ON ov.ott_o_id = o.o_id';

  db.query(sql, (err, rows) => {
    if (err) {
      res.json({ result: "error" });
      return console.log(err);
    }

    const videos = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // 비디오 정보와 OTT 정보를 저장할 객체 생성
      let video = {
        v_id: row.v_id,
        v_title: row.v_title,
        v_type: row.v_type,
        v_genre: row.v_genre,
        v_country: row.v_country,
        video_ott: [] // 비디오의 OTT 정보를 저장할 배열
      };

      // OTT 정보가 있는 경우 객체에 추가
      if (row.o_id && row.o_name) {
        video.video_ott.push({
          o_id: row.o_id,
          o_name: row.o_name
        });
      }

      // 이미 저장된 비디오인지 확인하여 비디오 배열에 추가
      const existingVideo = videos.find(v => v.v_id === video.v_id);
      if (existingVideo) {
        existingVideo.video_ott.push(...video.video_ott);
      } else {
        videos.push(video);
      }
    }

    res.json(videos);
  });
});

app.delete('/video/delete/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM video WHERE v_id = ?';

  db.query(sql, [id], (err, rows) => {
    if (err) {
      res.json({ result: "error" });
      return console.log(err);
    }
    res.json({ result: "success" });
  });
});

app.post('/video', async (req, res) => {
  try {
    const { v_title, v_type, v_genre, v_country, video_ott } = req.body;
	
    
	  db.query('INSERT INTO video (v_title, v_type, v_genre, v_country) VALUES (?, ?, ?, ?)',
  [v_title, v_type, v_genre, v_country], function (error, results) {
	  if (error) throw error;
	  const v_id = results.insertId;
	 
    const ottHasVideoValues = video_ott.map((ott_id) => `(${ott_id}, ${v_id})`).join(', ');
    db.query(`INSERT INTO ott_has_video VALUES ${ottHasVideoValues}`);
    
    res.status(201).json({ message: '비디오가 추가되었습니다.' });
	});
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

app.listen(port, () => {
  console.log(`서버 실행됨 (port ${port})`);
});
