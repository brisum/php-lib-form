(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($) {
    ;(function ($) {
        var AstuteForm = function ($form, options) {
            this.$form = $form;
            this.settings = $.extend(
                this.defaultSettings,
                {
                    type: this.$form.attr('method'),
                    url: this.$form.attr('data-url'),
                    beforeSend: this.$form.attr('data-before-send'),
                    afterSend: this.$form.attr('data-after-send'),
                    success: this.$form.attr('data-success'),
                    error: this.$form.attr('data-error'),
                    messageError: this.$form.attr('data-message-error')
                },
                options || {}
            );

            this.init();
        };

        AstuteForm.prototype.defaultSettings = {
            type: 'post',
            url: '',
            beforeSend: undefined,
            afterSend: undefined,
            success: undefined,
            error: undefined,
            messageError: 'Извините, возникла ошибка во время отправки данных'
        };

        AstuteForm.prototype.init = function () {
            var self = this;

            self.$form.on('click.astute-form', 'input[type=submit]', function () {
                self.$form.find("input[type=submit]").removeAttr("clicked");
                $(this).attr("clicked", true);
            });

            self.$form.submit(function (event) {
                var data = self.$form.serializeJSON(),
                    $submit = self.$form.find("input[type=submit][clicked]");

                if ($submit.length) {
                    data[$submit.attr('name')] = $submit.val();
                }

                if (!self.beforeSend(data)) {
                    return false;
                }

                self.loading(true);
                $.ajax({
                    type: self.settings.type,
                    url: self.settings.url,
                    data: data,
                    success: function (response, textStatus) {
                        var $div = $('<div></div>').html(response);

                        self.$form.html($div.find('form[data-astute-form]').html());

                        setTimeout(function() {
                            self.$form.find('.message.temporary').fadeOut(1500);
                        }, 2000);
                        setTimeout(function() {
                            self.$form.find('.message.temporary').remove();
                        }, 4000);

                        self.afterSend(response);
                        self.success(response);
                        self.loading(false);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        self.messageClear();
                        self.message(self.settings.messageError, 'alert');

                        self.afterSend(XMLHttpRequest, textStatus, errorThrown);
                        self.error(XMLHttpRequest, textStatus, errorThrown);
                        self.loading(false);
                    }
                });

                return false;
            })
        };

        AstuteForm.prototype.loading = function(isLoading)
        {
            if (isLoading) {
                this.$form.addClass('loading');
            } else {
                this.$form.removeClass('loading');
            }
        };

        AstuteForm.prototype.beforeSend = function(data)
        {
            var self = this;

            if (typeof self.settings.beforeSend === 'function') {
                return self.settings.beforeSend(data);
            }
            if (window[self.settings.beforeSend]) {
                return window[self.settings.beforeSend](data);
            }
            return true;
        };

        AstuteForm.prototype.afterSend = function(response)
        {
            var self = this;

            if (typeof self.settings.afterSend === 'function') {
                return self.settings.afterSend(response);
            }
            if (window[self.settings.afterSend]) {
                return window[self.settings.afterSend](response);
            }
        };

        AstuteForm.prototype.success = function()
        {
            var self = this;

            if (typeof self.settings.success === 'function') {
                self.settings.success();
            }
            if (window[self.settings.success]) {
                window[self.settings.success]();
            }
        };

        AstuteForm.prototype.error = function(XMLHttpRequest, textStatus, errorThrown)
        {
            var self = this;

            if (typeof self.settings.error === 'function') {
                return self.settings.error(XMLHttpRequest, textStatus, errorThrown);
            }
            if (window[self.settings.error]) {
                return window[self.settings.error](XMLHttpRequest, textStatus, errorThrown);
            }
        };

        AstuteForm.prototype.message = function(message, type)
        {
            var self = this,
                messageId = 'msg-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            self.$form.prepend('<div id="' + messageId + '" class="astute-form-alert ' + type + '">' + message + '</div>');
        };

        AstuteForm.prototype.messageClear= function()
        {
            var self = this;
            self.$form.find('.message').remove();
        };

        window.Brisum = window.Brisum || {};
        window.Brisum.AstuteForm = AstuteForm;

        $.fn.astuteForm = function(options) {
            return this.each(function() {
                new AstuteForm($(this), options);
            });
        };

        $(document).ready(function () {
            $('form[data-astute-form]').astuteForm();
        });
    }( jQuery ));
}));
