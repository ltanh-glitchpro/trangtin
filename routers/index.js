var express = require('express');
var router = express.Router();
var firstImage = require('../modules/firstimage');
var ChuDe = require('../models/chude');
var BaiViet = require('../models/baiviet');

// GET: Trang chủ
router.get('/', async (req, res) => {
	// Lấy chuyên mục hiển thị vào menu
	var cm = await ChuDe.find()
	.sort({ TenChuDe: 1 })
	.exec();

	// Lấy 15 bài viết mới nhất
	var bv = await BaiViet.find({ KiemDuyet: 1 })
	.sort({ NgayDang: -1 })
	.populate('ChuDe')
	.populate('TaiKhoan')
	.limit(15).exec();

	// Lấy 5 bài viết xem nhiều nhất hiện thị vào cột phải
	var xnn = await BaiViet.find({ KiemDuyet: 1 })
	.sort({ LuotXem: -1 })
	.populate('ChuDe')
	.populate('TaiKhoan')
	.limit(5).exec();

	res.render('index', {
		title: 'Trang chủ',
		chuyenmuc: cm,
		baiviet: bv,
		xemnhieunhat: xnn,
		firstImage: firstImage
	});
});

// GET: Lấy các bài viết cùng mã chủ đề
router.get('/baiviet/chude/:id', async (req, res) => {
	var id = req.params.id;

	// lấy chuyên mục hiển thị vào menu
	var cm = await ChuDe.find()

	// lấy thông tin chủ đề hiện tại
	var cd = await ChuDe.findById(id);

	// lấy 8 bài viết cùng chuyên mục
	var bv = await BaiViet.find({ ChuDe: id, KiemDuyet: 1 })
	.sort({ NgayDang: -1 })
	.populate('ChuDe')
	.populate('TaiKhoan')
	.limit(8).exec();

	// Lấy 3 bài viết xem nhiều nhất cùng hiện thị vào cột phải
	var xnn = await BaiViet.find({ ChuDe: id, KiemDuyet: 1 })
	.sort({ LuotXem: -1 })
	.populate('ChuDe')
	.populate('TaiKhoan')
	.limit(3).exec();

	res.render('baiviet_chude', {
		title: 'Bài viết cùng chuyên mục',
		chuyenmuc: cm,
		chude: cd,
		baiviet: bv,
		xemnhieunhat: xnn,
		firstImage: firstImage
	});
});

// GET: Xem bài viết
router.get('/baiviet/chitiet/:id', async (req, res) => {
	var id = req.params.id;

	// Lấy chuyên mục hiển thị vào menu
	var cm = await ChuDe.find();

	// Lấy thông tin bài viết hiện tại
	var bv = await BaiViet.findById(id)
	.populate('ChuDe')
	.populate('TaiKhoan')
	.exec();

	// Xử lý tăng lượt xem, chỉ tăng khi 1 máy tính chỉ xem 1 lần
	// Khởi tạo session nếu chưa có
	if (!req.session.DaXem) {
		req.session.DaXem = {};
	}
	if(!req.session.DaXem[bv._id]){
		await BaiViet.findByIdAndUpdate(id, {
			LuotXem: bv.LuotXem + 1
		});
		// Đánh dấu đã xem bài viết này
		req.session.DaXem[bv._id] = 1;
	}

	// Lấy 3 bài viết xem nhiều nhất hiện thị vào cột phải
	var xnn = await BaiViet.find({ KiemDuyet: 1 })
	.sort({ LuotXem: -1 })
	.populate('ChuDe')
	.populate('TaiKhoan')
	.limit(3).exec();

	res.render('baiviet_chitiet', {
		title: 'Chi tiết bài viết',
		chuyenmuc: cm,
		baiviet: bv,
		xemnhieunhat: xnn,
		firstImage: firstImage
	});
});

// GET: Tin mới nhất
router.get('/tinmoi', async (req, res) => {
	res.render('tinmoinhat', {
		title: 'Tin mới nhất'
	});
});

// POST: Kết quả tìm kiếm
router.post('/timkiem', async (req, res) => {
	var tukhoa = req.body.tukhoa;
	
	// Xử lý tìm kiếm bài viết
	var bv = [];
	
	res.render('timkiem', {
		title: 'Kết quả tìm kiếm',
		baiviet: bv,
		tukhoa: tukhoa
	});
});

// GET: Lỗi
router.get('/error', async (req, res) => {
	res.render('error', {
		title: 'Lỗi'
	});
});

// GET: Thành công
router.get('/success', async (req, res) => {
	res.render('success', {
		title: 'Hoàn thành'
	});
});

module.exports = router;