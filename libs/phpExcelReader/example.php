<?php
// Test CVS

require_once 'Excel/reader.php';


// ExcelFile($filename, $encoding);
$data = new Spreadsheet_Excel_Reader();


// Set output Encoding.
$data->setOutputEncoding('CP1251');

/***
* if you want you can change 'iconv' to mb_convert_encoding:*/
 $data->setUTFEncoder('mb');
/*
**/

/***
* By default rows & cols indeces start with 1
* For change initial index use:
* $data->setRowColOffset(0);
*
**/



/***
*  Some function for formatting output.
* $data->setDefaultFormat('%.2f');
* setDefaultFormat - set format for columns with unknown formatting
*
* $data->setColumnFormat(4, '%.3f');
* setColumnFormat - set format for column (apply only to number fields)
*
**/

$data->read('Apartamente.xls');

/*


 $data->sheets[0]['numRows'] - count rows
 $data->sheets[0]['numCols'] - count columns
 $data->sheets[0]['cells'][$i][$j] - data from $i-row $j-column

 $data->sheets[0]['cellsInfo'][$i][$j] - extended info about cell
    
    $data->sheets[0]['cellsInfo'][$i][$j]['type'] = "date" | "number" | "unknown"
        if 'type' == "unknown" - use 'raw' value, because  cell contain value with format '0.00';
    $data->sheets[0]['cellsInfo'][$i][$j]['raw'] = value if cell without format 
    $data->sheets[0]['cellsInfo'][$i][$j]['colspan'] 
    $data->sheets[0]['cellsInfo'][$i][$j]['rowspan'] 
*/

error_reporting(E_ALL ^ E_NOTICE);
echo "<table border='2' bordercolor='#000000'><tr bgcolor='#82902a'>";

for ($i = 1; $i <= $data->sheets[0]['numRows']; $i++) {
	for ($j = 1; $j <= $data->sheets[0]['numCols']; $j++) {
		if (($i == 1) and ($j == 1))
		{
			echo "<td width='100' nowrap='wrap' colspan='".$data->sheets[0]['numCols']."'>".$data->sheets[0]['cells'][$i][$j].
				"&nbsp;</td>";
		}
		elseif (($i > 1) )
			echo "<td width='100' nowrap='wrap' width='100'>".$data->sheets[0]['cells'][$i][$j]."&nbsp;</td>";
	}
	echo "</tr><tr ";
	if ($i % 2)
		echo " bgcolor='#999999'>";
	else
		echo " bgcolor='#dcdcdc'>";

}
echo "</table>";

//print_r($data);
//print_r($data->formatRecords);
?>
