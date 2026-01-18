<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PdfKrsController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/cetak-krs', [PdfKrsController::class, 'cetakKrs']);