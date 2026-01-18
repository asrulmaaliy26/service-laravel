<style>/* ktm.css */
.kotak_kartu_depan,
.kotak_kartu_belakang {
    width: 8.56cm;
    height: 5.4cm;
    border-radius: 10px;
    font-family: Tahoma;
    margin-left: .5mm;
    float: left;
    position: relative;
}

.foto {
    width: 17mm;
    height: 22mm;
    position: absolute;
    margin-left: 25px;
}

.label {
    text-align: right;
    margin-right: 1mm;
    font-size: 5pt;
}

.textbox {
    text-align: right;
    margin-right: 1mm;
    font-size: 6pt;
}

img {
    width: 17mm;
    height: 22mm;
}

.qrcode {
    float: right;
    width: 2.1cm;
    height: 2.1cm;
    background-size: 80px 80px;
}


</style>
<!-- Kartu Depan -->
<div class="kotak_kartu_depan" style="background:url('{{ asset('assets/bg_ktm_depan.gif') }}') no-repeat; background-size:100% 100%;">
  <div style="padding-top:19mm">
    <div class="foto">
      <img src="{{ $foto }}" alt="Foto Mahasiswa">
    </div>

    <div style="float:right;width:4cm;">
      <div class="label"><em>Nama</em></div>
      <div class="textbox"><strong><em>{{ ucwords($diri['Nama_Lengkap']) }}</em></strong></div>

      <div class="label"><em>Program Studi</em></div>
      <div class="textbox">
        <strong><em>{{ ucwords($prodi) }} ({{ $his_pdk['Prodi'] }})</em></strong>
      </div>

      <div class="label"><em>Tempat Tanggal Lahir</em></div>
      <div class="textbox">
        <strong><em>{{ ucwords($diri['Kota_Lhr']) }}, {{ $diri['Tgl_Lhr'] }}</em></strong>
      </div>

      <div class="label"><em>Alamat</em></div>
      <div class="textbox">
        <strong><em>{{ ucwords($diri['Desa']) }} {{ ucwords($diri['Kec']) }} {{ ucwords($diri['Kab']) }} {{ ucwords($diri['Prov']) }}</em></strong>
      </div>
    </div>
  </div>
</div>

<!-- Kartu Belakang -->
<div class="kotak_kartu_belakang" style="background:url('{{ asset('assets/bg_ktm_belakang.gif') }}') no-repeat; background-size:100% 100%;">
  <div style="padding-top:19mm">
    <div class="qrcode" style="margin-right:3mm; background-image:url('{{ $qrcode }}');"></div>
  </div>
  <div>
    <div style="text-align:right;margin-right:4mm;font-size:5pt;">
      <em>Nomor Induk Mahasiswa</em>
    </div>
    <div style="text-align:right;margin-right:4mm;font-size:8pt;">
      <strong><em>{{ $his_pdk['NIM'] }}</em></strong>
    </div>
  </div>
</div>