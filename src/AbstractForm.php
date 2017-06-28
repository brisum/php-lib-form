<?php

namespace Brisum\Lib\Form;

use Brisum\Lib\View;
use Brisum\Lib\ObjectManager;

abstract class AbstractForm {
    const STATUS_SUCCESS = 'success';
    const STATUS_ERROR = 'error';

    /**
     * @var ObjectManager
     */
    protected $objectManager;

    /**
     * @var string
     */
    protected $name;

    /**
     * @var array
     */
    protected $args;

    /**
     * @var array
     */
    protected $request;

    /**
     * @var array
     */
    protected $response = [
        'form-name' => '',
        'status' => '',
        'msg' => '',
        'fields' => [],
        'errors' => []
    ];

    /**
     * @var View
     */
    protected $view;

    /**
     * @var string
     */
    protected $template;

    /**
     * AbstractForm constructor.
     * @param ObjectManager $objectManager
     * @param array $args
     */
    public function __construct(
        ObjectManager $objectManager,
        array $args = []
    ) {
        $this->objectManager = $objectManager;
        $this->args = $args;
        $this->name = base64_encode(get_called_class());
        $this->view = $objectManager->create('Brisum\Lib\View', ['dirTemplate' => $this->getFormDir()]);
        $this->template = $this->getTemplate();

        if (session_id() == false) {
            session_start();
        }

        $this->init();
    }

    protected function init()
    {
        if ('post' == strtolower($_SERVER['REQUEST_METHOD'])) {
            $this->request = &$_POST;
        }

        $this->response['form-name'] = $this->name;
    }

    /**
     * @return bool
     */
    protected function hasPermission()
    {
        return true;
    }

    /**
     * @return bool
     */
    public function parseRequest() {
        if (null === $this->request) {
            if (!isset($_SESSION["brisum_form_{$this->name}"])) {
                $_SESSION["brisum_form_{$this->name}"] = $this->response;
            }
            return false;
        }
        if (empty($this->request['form-name'])) {
            return false;
        }
        if ($this->request['form-name'] != $this->name) {
            $this->response['status'] = 'error';
            $this->response['msg'] = 'Invalid form name.';
            return false;
        }
        if (!$this->hasPermission()) {
            $this->response['status'] = 'error';
            $this->response['msg'] = 'Permission denied.';
            return false;
        }

        $this->clean();
        $this->validate();

        $this->response['errors'] = array_filter($this->response['errors']);
        if (empty($this->response['errors'])) {
            $this->response['status'] = self::STATUS_SUCCESS;
            $this->response['msg'] = 'Данные успешно сохранены';

            $this->processSuccess();
            $_SESSION["brisum_form_{$this->name}"] = $this->response;

            return true;
        } else {
            $this->response['status'] = self::STATUS_ERROR;

            $this->processFail();
            $_SESSION["brisum_form_{$this->name}"] = $this->response;

            return false;
        }
    }

    /**
     * @return string
     */
    public function content()
    {
        $response = $_SESSION["brisum_form_{$this->name}"];

        $this->clean();
        return $this->view->content($this->template, ['form' => $response]);
    }

    /**
     * @return void
     */
    public function clean()
    {
        unset($_SESSION["brisum_form_{$this->name}"]);
    }

    /**
     * @return string
     */
    protected function getFormDir()
    {
        $classFilePath = $this->objectManager->get('Composer\Autoloader')->findFile(get_called_class());
        return dirname($classFilePath);
    }

    /**
     * @return string
     */
    abstract protected function getTemplate();

    /**
     * @return void
     */
    abstract protected function validate();

    /**
     * @return void
     */
    abstract protected function processSuccess();

    /**
     * @return void
     */
    abstract protected function processFail();
}
