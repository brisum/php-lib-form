;(function (window, $, UNDEFINED) {
    window.Brisum = window.Brisum || {};

    window.Brisum.AstuteForm = {
        init: function (name, cbStart, cbFinish) {
            if (0 == $('#' + name).length) {
                return true;
            }

            var $form = $('#' + name);

            $form.on('click', 'input[type=submit]', function () {
                $("input[type=submit]", $form).removeAttr("clicked");
                $(this).attr("clicked", true);
            });

            $form.submit(function (event) {
                var data = $form.serializeJSON(),
                    $submit = $("input[type=submit][clicked]", $form),
                    resultBefore = true;

                if ($submit.length) {
                    data[$submit.attr('name')] = $submit.val();
                }

                if (typeof cbStart === 'function') {
                    resultBefore = cbStart();
                } else if (window[cbStart]) {
                    resultBefore = window[cbStart]();
                }
                if (false === resultBefore) {
                    return false;
                }

                //Post Form with data
                $.ajax({
                    type: 'post',
                    url: '/component-manager/request/form/listener.php',
                    data: data,
                    success: function (response, textStatus) {
                        var $div = $('<div></div>').html(response);

                        $('#' + name).parent().html($div.html());

                        Brisum.AstuteForm.init(name, cbStart, cbFinish);

                        if (typeof cbFinish === 'function') {
                            cbFinish()
                        } else if ( window[cbFinish] ) {
                            window[cbFinish](response);
                        }

                        setTimeout(function() {
                            $('#' + name + ' .form-msg.temporary').fadeOut(1500);
                        }, 2000);
                        setTimeout(function() {
                            $('#' + name + ' .form-msg.temporary').remove();
                        }, 4000);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        Brisum.AstuteForm.message(name, 'Извините, возникла ошибка во время отправки данных', 'alert');

                        if ( window[cbFinish] ) {
                            window[cbFinish]('error_response');
                        }
                    }
                });

                return false;
            });
        },

        message: function(name, message, type)
        {
            var messageId = 'msg-' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            $('#' + name).prepend('<div class="row"><div class="small-12 columns"><div id="' + messageId + '" class="callout ' + type + '">' + message + '</div></div></div>');
        }
    };
})(window, jQuery);
