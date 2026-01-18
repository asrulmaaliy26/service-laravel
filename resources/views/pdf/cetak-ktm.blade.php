<!-- Kartu Depan -->
<div class="kotak_kartu_depan" 
     style="width:8.56cm; height:5.4cm; border-radius:10px; font-family:Tahoma; margin-left:.5mm; float:left; position:relative; 
            background:url('{{ asset('assets/bg_ktm_depan.gif') }}') no-repeat; background-size:100% 100%;">
  <div style="padding-top:19mm; position:relative;">
    <div class="foto" style="width:17mm; height:22mm; position:absolute; margin-left:25px;">
      <img src="{{ $foto }}" alt="Foto Mahasiswa" style="width:17mm; height:22mm;">
    </div>

    <div style="float:right; width:4cm;">
      <div class="label" style="text-align:right; margin-right:1mm; font-size:5pt;"><em>Nama</em></div>
      <div class="textbox" style="text-align:right; margin-right:1mm; font-size:6pt;"><strong><em>{{ ucwords($diri['Nama_Lengkap']) }}</em></strong></div>

      <div class="label" style="text-align:right; margin-right:1mm; font-size:5pt;"><em>Program Studi</em></div>
      <div class="textbox" style="text-align:right; margin-right:1mm; font-size:6pt;"><strong><em>{{ ucwords($prodi) }} ({{ $his_pdk['Prodi'] }})</em></strong></div>

      <div class="label" style="text-align:right; margin-right:1mm; font-size:5pt;"><em>Tempat Tanggal Lahir</em></div>
      <div class="textbox" style="text-align:right; margin-right:1mm; font-size:6pt;"><strong><em>{{ ucwords($diri['Kota_Lhr']) }}, {{ $diri['Tgl_Lhr'] }}</em></strong></div>

      <div class="label" style="text-align:right; margin-right:1mm; font-size:5pt;"><em>Alamat</em></div>
      <div class="textbox" style="text-align:right; margin-right:1mm; font-size:6pt;">
        <strong><em>{{ ucwords($diri['Desa']) }} {{ ucwords($diri['Kec']) }} {{ ucwords($diri['Kab']) }} {{ ucwords($diri['Prov']) }}</em></strong>
      </div>
    </div>
  </div>
</div>

<!-- Kartu Belakang -->
<div class="kotak_kartu_belakang" 
     style="width:8.56cm; height:5.4cm; border-radius:10px; font-family:Tahoma; margin-left:.5mm; float:left; position:relative; 
            background:url('{{ asset('assets/bg_ktm_belakang.gif') }}') no-repeat; background-size:100% 100%;">
  <div style="padding-top:19mm; position:relative;">
    <div class="qrcode" style="float:right; width:2.1cm; height:2.1cm; margin-right:3mm; background-image:url('{{ $qrcode }}'); background-size:80px 80px;"></div>
  </div>
  <div>
    <div style="text-align:right; margin-right:4mm; font-size:5pt;"><em>Nomor Induk Mahasiswa</em></div>
    <div style="text-align:right; margin-right:4mm; font-size:8pt;"><strong><em>{{ $his_pdk['NIM'] }}</em></strong></div>
  </div>
</div>
