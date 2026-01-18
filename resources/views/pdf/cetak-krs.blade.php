<style>
</style>

<!-- ================== HEADER DIBUNGKUS BOXKARTU ================== -->
<div class="boxkartu">
  <div class="header">
    <div class="logo">
      <!-- <img src="{{ asset('assets/logo.png') }}" alt="Logo"> -->
      <img src="{{ public_path('assets/logo.png') }}" width="50" alt="Logo">
    </div>
    <div style="font-size:17pt; font-family:'Arial', sans-serif;"><strong>KARTU RENCANA STUDI</strong></div>
    <div style="font-size:14pt; font-family:'Arial', sans-serif;"><strong>SEKOLAH TINGGI AGAMA ISLAM AL MANNAN TULUNGAGUNG</strong></div>
    <div style="font-size:14pt; font-family:'Arial', sans-serif;">
      <strong>Tahun Akademik {{ $tahunAkademik }} {{ $semesterTA }}</strong>
    </div>
  </div>
</div>

<hr>

<!-- ================== INFO MAHASISWA ================== -->
<div style="width:50%; float:left;">
  <div class="kolom1">Nama</div>
  <div class="kolom2">: {{ $mahasiswa['Nama_Lengkap'] }}</div>

  <div class="kolom1">NIM</div>
  <div class="kolom2">: {{ $histori['NIM'] }}</div>

  <div class="kolom1">Prodi</div>
  <div class="kolom2">: {{ $histori['Prodi'] }}</div>
</div>

<div style="width:50%; float:left;">
  <div class="kolom1">Semester</div>
  <div class="kolom2">: {{ $semester }}</div>

  <div class="kolom1">Program</div>
  <div class="kolom2">: {{ $histori['Program'] }}</div>

  <div class="kolom1">Kelas</div>
  <div class="kolom2">: {{ $histori['Kelas'] ?? '-' }}</div>
</div>

<!-- ================== TABEL MK ================== -->
<div style="width:100%; float:left;">
  <table width="100%" border="1" style="border-collapse: collapse;">
    <thead>
      <tr>
        <th>No</th>
        <th>Kode MK</th>
        <th>Mata Kuliah</th>
        <th>SKS</th>
        <th>Dosen</th>
      </tr>
    </thead>
    <tbody>
      @php $totalSksTmp = 0; @endphp
      @foreach($mataKuliah as $i => $mk)
      @php $totalSksTmp += $mk['sks']; @endphp
      <tr>
        <td align="center">{{ $i + 1 }}</td>
        <td>{{ $mk['kode'] }}</td>
        <td>{{ $mk['nama'] }}</td>
        <td align="center">{{ $mk['sks'] }}</td>
        <td>{{ $mk['dosen'] }}</td>
      </tr>
      @endforeach

      <tr>
        <td colspan="3" align="center"><b>Total SKS</b></td>
        <td align="center"><b>{{ $totalSksTmp }}</b></td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ================== MK TIDAK LULUS ================== -->
@if(!empty($mkTidakLulus))
<div style="font-size:14pt; font-family:'Arial', sans-serif;"><strong>MATA KULIAH SEMESTER LALU YANG BELUM LULUS</strong></div>
<div style="width:100%; float:left;">
  <table width="100%" border="1" style="border-collapse: collapse;">
    <thead>
      <tr>
        <th>No</th>
        <th>Mata Kuliah</th>
        <th>SMT</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      @foreach($mkTidakLulus as $i => $mk)
      <tr>
        <td align="center">{{ $i + 1 }}</td>
        <td>{{ $mk['nama'] }}</td>
        <td align="center">{{ $mk['smt'] }}</td>
        <td align="center">{{ $mk['status'] }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>
@endif

<br><br>

<table width="100%" border="0" style="border:0; margin-top:20pt;">
<tr>
    <td width="50%" style="text-align:left; vertical-align:top;">
        Ketua Prodi {{ $histori['Prodi'] }}<br><br><br><br><br><br>
        <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
    </td>
    <td width="50%" style="text-align:left; vertical-align:top;">
        Dosen Pembimbing Akademik<br><br><br><br><br><br>
        <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
    </td>
</tr>
</table>