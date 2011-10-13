#!/usr/bin/php
<?php
$contents = file_get_contents('in');
$result = preg_replace("///\\s+'?([a-z0-9]+)'?\\s+([ a-z,A-Z=\\(\\)\\.0-9_/*';-]+)/um", "<checkbox id=\"$1\" class=\"kojslint_checkbox\" label=\"$2\" />", $searchText);
echo $result;
echo PHP_EOL;
?>
