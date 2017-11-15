<?php

use Brisum\Lib\Form\AbstractForm;
use Brisum\Lib\ObjectManager;

header("X-Robots-Tag: noindex, nofollow", true);

$redirect = empty($_SERVER['HTTP_REFERER']) ? '/' : $_SERVER['HTTP_REFERER'];
if ( !isset($_REQUEST['form-name']) ) {
    header("Location: {$redirect}", 302);
    die();
}

$classForm = base64_decode($_REQUEST['form-name']);
/** @var AbstractForm $form */
$form = ObjectManager::getInstance()->create($classForm);

$form->parseRequest();
echo $form->content();
