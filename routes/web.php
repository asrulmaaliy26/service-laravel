<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PdfKrsController;
use App\Http\Controllers\PdfCetakKTMController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/cetak-krs', [PdfKrsController::class, 'cetakKrs']);
Route::get('/cetak-ktm', [PdfCetakKTMController::class, 'cetakKtm']);