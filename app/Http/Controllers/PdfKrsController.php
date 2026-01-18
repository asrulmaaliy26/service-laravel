<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Mpdf\Mpdf;

class PdfKrsController extends Controller
{
    public function cetakKrs(Request $request)
    {
        $jsonData = $request->data;
        $token = $request->token;

        // 🔐 Validasi token
        $expected = hash_hmac('sha256', $jsonData, config('pdf.secret'));
        abort_if($token !== $expected, 403);

        // Decode data dari CI4
        $data = json_decode(base64_decode($jsonData), true);


        // return view('pdf.cetak-krs', $data);
        // Render view menjadi HTML
        $html = view('pdf.cetak-krs', $data)->render();

        // Inisialisasi mPDF
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_left' => 10,
            'margin_right' => 10,
            'margin_top' => 15,
            'margin_bottom' => 10,
        ]);

        $publicCssPath = public_path('mpdfstyletables.css');
        if (file_exists($publicCssPath)) {
            $css = file_get_contents($publicCssPath);
            $mpdf->WriteHTML($css, \Mpdf\HTMLParserMode::HEADER_CSS);
        }

        // Ambil CSS dari resources/views/pdf/cetak-krs.css
        $viewCssPath = resource_path('views/pdf/cetak-krs.css');
        if (file_exists($viewCssPath)) {
            $css = file_get_contents($viewCssPath);
            $mpdf->WriteHTML($css, \Mpdf\HTMLParserMode::HEADER_CSS);
        }

        // Tulis HTML
        $mpdf->WriteHTML($html, \Mpdf\HTMLParserMode::HTML_BODY);

        // Output PDF ke browser
        return $mpdf->Output("KRS_{$data['mahasiswa']['Nama_Lengkap']}.pdf", \Mpdf\Output\Destination::INLINE);
    }
}
