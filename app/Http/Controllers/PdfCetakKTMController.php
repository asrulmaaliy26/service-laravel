<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Mpdf\Mpdf;

class PdfCetakKTMController extends Controller
{
    //
    public function cetakKtm(Request $request)
    {
        $jsonData = $request->get('data');
        $token = $request->get('token');

        // 🔐 Validasi token
        $expected = hash_hmac('sha256', $jsonData, config('pdf.secret'));
        abort_if($token !== $expected, 403, 'Token tidak valid');

        // Decode data dari CI4
        $data = json_decode(base64_decode($jsonData), true);

        // dd($data);
        return view('pdf.cetak-ktm1', $data);
        // Render view menjadi HTML
        $html = view('pdf.cetak-ktm', $data)->render();

        // Generate PDF
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_left' => 10,
            'margin_right' => 10,
        ]);
        $publicCssPath = public_path('mpdfstyletables.css');
        if (file_exists($publicCssPath)) {
            $css = file_get_contents($publicCssPath);
            $mpdf->WriteHTML($css, \Mpdf\HTMLParserMode::HEADER_CSS);
        }

        // Ambil CSS dari resources/views/pdf/cetak-krs.css
        $viewCssPath = resource_path('views/pdf/cetak-ktm.css');
        if (file_exists($viewCssPath)) {
            $css = file_get_contents($viewCssPath);
            $mpdf->WriteHTML($css, \Mpdf\HTMLParserMode::HEADER_CSS);
        }

        $mpdf->WriteHTML($css, \Mpdf\HTMLParserMode::HEADER_CSS);
        $mpdf->WriteHTML($html, \Mpdf\HTMLParserMode::HTML_BODY);


        // Kirim PDF ke browser
        return $mpdf->Output('KTM_' . $data['diri']['Nama_Lengkap'] . '.pdf', \Mpdf\Output\Destination::INLINE);
    }
}
