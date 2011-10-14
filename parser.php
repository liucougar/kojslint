#!/usr/bin/php
<?php
$contents = file_get_contents('php://stdin');
$result = preg_replace("/\s+'?([a-z0-9]+)'?\s+([^\n]+)/um", "<checkbox id=\"$1\" class=\"kojslint_checkbox\" label=\"$2\" />", $contents);
echo $result;
echo PHP_EOL;
?>
