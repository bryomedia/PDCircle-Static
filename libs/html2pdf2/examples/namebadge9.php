<?php
/**
 * HTML2PDF Librairy - example
 *
 * HTML => PDF convertor
 * distributed under the LGPL License
 *
 * @author      Laurent MINGUET <webmaster@html2pdf.fr>
 *
 * isset($_GET['vuehtml']) is not mandatory
 * it allow to display the result in the HTML format
 */
    // get the HTML
    ob_start();
    $num = 'CMD01-'.date('ymd');
    $nom = 'DUPONT Alphonse';
    $date = '01/01/2012';
?>
<style type="text/css">
<!--
    div.zone { border: none; border-radius: 6mm; background: #FFFFFF; border-collapse: collapse; padding:3mm; font-size: 2.7mm;}
    h1 { padding: 0; margin: 0; color: #DD0000; font-size: 7mm; }
    h2 { padding: 0; margin: 0; color: #222222; font-size: 5mm; position: relative; }
-->
</style>
<page format="215.9x279.4" orientation="P" backcolor="#AAAACC" style="font: arial;">

<table style="width: 100%">
<tr>
<td style="width: 50%">
    <table style="width: 3.5in; height: 2.75in; border-width: 1mm; border-color: black; border-style: solid; float: left;">
    <tr>
        <td>
        <img src="res/logo_qrbadge_2022.png" style="width: 3.5in;" />
        </td>
    </tr>
    <tr>
        <td>
        <div style="text-align: left; width: 2in;">{$NAME}</div>
        <div style="text-align: right; width: 1.5in;">
            <qrcode value="1982" ec="L" style="border: none; width: 1.4in;"></qrcode>
        </div>
        </td>
    </tr>
    </table>
</td>
<td style="width: 50%">
    <table style="width: 3.5in; height: 2.75in; border-width: 1mm; border-color: black; border-style: solid; float: right;">
    <tr>
        <td>
        <img src="res/logo_qrbadge_2022.png" style="width: 3.5in;" />
        </td>
    </tr>
    <tr>
        <td>
        <div style="text-align: left; width: 2in;">{$NAME}</div>
        <div style="text-align: right; width: 1.5in;">
            <qrcode value="1982" ec="L" style="border: none; width: 1.4in;"></qrcode>
        </div>
        </td>
    </tr>
    </table>
</td>
</tr>
</table>


</page>
<?php
     $content = ob_get_clean();

    // convert
    require_once(dirname(__FILE__).'/../html2pdf.class.php');
    try
    {
        $html2pdf = new HTML2PDF('P', 'A4', 'fr', true, 'UTF-8', 0);
        $html2pdf->pdf->SetDisplayMode('fullpage');
        $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
        $html2pdf->Output('ticket.pdf');
    }
    catch(HTML2PDF_exception $e) {
        echo $e;
        exit;
    }

