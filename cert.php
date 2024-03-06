<?php
// sudo apt install php-imagick php-sqlite3
// cp db/certs.sqlite3.empty db/certs.sqlite3
// chmod 777 db/certs.sqlite3
// ---
// create table certs(cert_id char(10) primary key, name varchar(50), game_time timestamp default current_timestamp, erd_image text);

session_start();

$cert_db = new PDO('sqlite:./db/certs.sqlite3');
if(isset($_GET['id'])) {
   // show certificate
   $cert_id = $_GET['id'];
} elseif(isset($_POST['playername']) && isset($_POST['image'])) {
    // store certificate
    $playername = $_POST['playername'];
    $playername = substr(strip_tags($playername), 0, 60);
    $cert_id = isset($_SESSION['id']) ? $_SESSION['id'] : substr(md5(uniqid("monster")),-10);
    $stmt = $cert_db->prepare('INSERT INTO certs(cert_id, name, erd_image) VALUES(:c, :n, :i) ON CONFLICT(cert_id) DO UPDATE SET name = :n, erd_image = :i');
    $stmt->bindValue(':c', $cert_id);
    $stmt->bindValue(':n', $playername);
    $stmt->bindValue(':i', base64_decode(str_replace('data:image/png;base64,','', $_POST['image'])), PDO::PARAM_LOB);
    $stmt->execute();
    echo $cert_id;
    $_SESSION['id'] = $cert_id;
    die();
} elseif(isset($_SESSION['id'])) {
    $cert_id = $_SESSION['id'];
} else {
    http_response_code(400);
    die('invalid request');
}

$stmt = $cert_db->prepare("SELECT name, erd_image FROM certs WHERE cert_id = :c");
$stmt->execute(array(":c" => $cert_id));
//$stmt->bindColumn(1, $playername);
//$stmt->bindColumn(2, $image, PDO::PARAM_LOB);

$res = $stmt->fetch(PDO::FETCH_ASSOC);
$playername = $res['name'];
$image = $res['erd_image'];

if($image == null) { http_response_code(400); die("invalid certificate id"); }

if(isset($_GET['check'])) { die("valid"); }

$html = <<<HTML
<html>
<body style="font-family:Helvetica">

<h1 style="color:white; text-align:center; font-size:40pt">MonstER Park</h1>
<h1 style="text-align:center; font-size:8pt">&nbsp;<br>
<span style="text-align:center; font-size:32pt">Certificate of Completion</span>
<span style="text-align:center; font-size:8pt"><br>&nbsp;<br></span>
<span style="text-align:center; font-size:22pt">This is to certify that</span>
<span style="text-align:center; font-size:8pt"><br>&nbsp;<br></span>
<span style="text-align:center; font-size:32pt">$playername</span>
<span style="text-align:center; font-size:8pt"><br>&nbsp;<br></span>
<span style="text-align:center; font-size:22pt">has successfully completed the<br>learning game MonstER Park.</span>
<h1 style="font-size:19.5pt;"><br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br></h1>
<h1 style="text-align:center; font-size:16pt;">ID: $cert_id</h1>
<h1 style="text-align:center; font-size:16pt;">URL: https://www.monst-er.de/cert.php?id=$cert_id</h1>
<h1 style="text-align:right; font-size:10pt">monst-er.de</h1>

</body></html>
HTML;

//////////////////////////// Erzeugung eures PDF Dokuments \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// TCPDF Library laden
require_once('tcpdf/tcpdf.php');

// Erstellung des PDF Dokuments
$pdf = new TCPDF('P', PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

// Dokumenteninformationen
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor("monst-er.de");
$pdf->SetTitle('Certificate');
$pdf->SetSubject('Certificate');


// Header und Footer Informationen
$pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
$pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));
$pdf->SetPrintHeader(false);
$pdf->SetPrintFooter(false);

// Auswahl des Font
$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);


// Auswahl der MArgins
$pdf->SetMargins(PDF_MARGIN_LEFT, 0.2*PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
$pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
$pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

// Automatisches Autobreak der Seiten
$pdf->SetAutoPageBreak(TRUE, 0.0*PDF_MARGIN_BOTTOM);

// Image Scale
$pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

// Schriftart
$pdf->SetFont('helvetica', '', 10);

// Neue Seite
$pdf->AddPage();

//$pdf->SetFillColor(84, 192, 238 );
//$pdf->Rect(0, 0, $pdf->getPageWidth(), $pdf->getPageHeight(), 'DF', "");

// Fügt den HTML Code in das PDF Dokument ein

// Image($file, $x='', $y='', $w=0, $h=0, $type='', $link='', $align='', $resize=false, $dpi=300, $palign='', $ismask=false, $imgmask=false, $border=0, $fitbox=false, $hidden=false, $fitonpage=false)

$pdf->Image("@".$image, 40, 117, 980/6, 782/6, '', '', '', false, 300, '', false, false, 0);
$pdf->Image("images/certificate_ribbon.png", 17, 20, 714/4, 122/4, '', '', '', false, 300, '', false, false, 0);
$pdf->Image("images/trina.png", 150, 7, 140/5, 288/5, '', '', '', false, 300, '', false, false, 0);
$pdf->StartTransform();
$pdf->MirrorH(50);
$pdf->Image("images/fibi.png", 40, 228, 140/6, 288/6, '', '', '', false, 300, '', false, false, 0);
$pdf->StopTransform();
$pdf->Image("images/bolbo.png", 150, 218, 140/5, 288/5, '', '', '', false, 300, '', false, false, 0);

$pdf->writeHTML($html, true, false, true, false, '');

$pdf->deletePage(2);

//Ausgabe der PDF

//Variante 1: PDF direkt an den Benutzer senden:
$pdf->Output("Certificate_MonstER-Park.pdf", 'I');

//Variante 2: PDF im Verzeichnis abspeichern:
//$pdf->Output(dirname(__FILE__).'/'.$pdfName, 'F');
//echo 'PDF herunterladen: <a href="'.$pdfName.'">'.$pdfName.'</a>';

?>
