(function($) {
    /* Getting shifts array from localstorage so as to render them */
    let shifts = JSON.parse(window.localStorage.getItem('shifts')) || [];

    /* jQuery core elements declaration block */
    const $addBtn = $('.add-shift-btn');
    const $saveBtn = $('.save-shift-btn');
    const $cancelBtn = $('.settings-cancel');
    const $scheduleTime = $('.schedule-table-work-time');
    const $scheduleCol = $('.schedule-table-grid-col-wrapper');
    const workHours = [
        ["06:00 AM","01:00 AM"],
        ["06:00 AM","01:00 AM"],
        ["06:00 AM","01:00 AM"],
        ["06:00 AM","01:00 AM"],
        ["06:00 AM","01:00 AM"],
        ["06:00 AM","01:00 AM"],
        ["06:00 AM","01:00 AM"]
    ];

    /* Functions declaration block */
    /* Function with shifts' layout */
    const generateShift = ({
        name = '',
        topOffset = 0,
        height= 80,
        groupName = 'new',
        color = 'lightgray',
        index,
        isCompleted = false,
        isDisabled = false
    }) => {
        return `
        <div class='shift ${isCompleted ? 'completed' : ''} ${isDisabled ? 'disabled': ''} '
            style='top: ${topOffset}px; height: ${height}px; background-color: ${color}'
            data-index='${index}'
            data-group-key='${groupName}'>
            <div class="shift-resizer shift-resizer-bottom"></div>
            <span class="shift-edit mdi mdi-pencil"></span>
            <span class='shift-symbol'></span>
            <h5 class='shift-name'>${name}</h5>
            <span class='shift-remove mdi mdi-close'></span>
            <div class='shift-resizer shift-resizer-bottom'></div>
        </div>
        `
    };

    /* AM to PM conversion */
    const convertTime = (time12h) => {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }

        return hours;
    };

    const handleMultipleShiftItemsChange = ($selected) => {
        $selected.draggable({
            axis: 'y',
            containment: 'parent',
            stop: (e, ui) => {
                  const requiredElements = $(ui.helper[0]).hasClass('ui-selected') ?
                      $('.ui-selected')
                      : $(ui.helper[0]);

                  const top = parseInt(requiredElements.css('top'));

                  requiredElements.css({
                      'top': 40 * Math.round((top / 40)) + 'px',
                  })
            },
            multiple: true
        });

        $selected.resizable({
            minHeight: 40,
            handles: 'n, s',
            alsoResize: '.ui-selected',
            containment: 'parent',
            resize: e => {
                const $target = $(e.target),
                    groupKey = $target.data('group-key'),
                    top = $target.css('top');

                $(`.ui-selected[data-group-key='${groupKey}']`).css('top', top);
            },
            stop: (e, ui) => {
                const requiredElements = $(ui.element[0]).hasClass('ui-selected') ?
                    $('.ui-selected')
                    : $(ui.element[0]);

                const height = parseInt(requiredElements.css('height'));

                requiredElements.css({
                    'height': 40 * Math.round((height / 40)) + 'px',
                    'width': '95%'
                });
            },
        })
    };

    const handleColorSelect = (e, $shiftElements) => {
        let selectedColor = $(e.currentTarget).attr('data-value');
        $(e.currentTarget)
            .parents('.color-select')
            .attr('data-selected-color', selectedColor)
            .find('.color-select-preview')
            .css('backgroundColor', selectedColor);
        $shiftElements.css('backgroundColor', selectedColor);
    };
    /*
        Function for saving, creating and updating shifts' parameters
        shift: approptiate shift's params from LocalStorage
        $shiftElements: jQuery Collection of shift elements
        action: [
            'new' - if you need to save new shift's settings
            'cancel' - if you need to reset all settings and remove settings menu
            'update' - if you need to update existing shift's settings
        ]
    */
    const closeShiftEditMode = ({
        action = 'new',
        shift,
        $shiftElements
    }) => {
        if (action === 'cancel') {
            $saveBtn.css('display', 'none');
            $('.schedule-settings').removeClass('active');
            $addBtn.css('display', 'block');

            $shiftElements.addClass('completed');

            $('#shift-name').val('').removeClass('error').siblings('.error-message').removeClass('active');
            $('#dining-select').val('');
            $('[data-group-key="new"]').remove();

            return renderShifts();
        }

        $shiftElements = $shiftElements || $('[data-group-key=\'new\']');
        let shiftSettings = {};
        const shiftName = $('#shift-name').val();
        const diningArea = $('#dining-select').val();
        const shiftColor = $('.color-select').attr('data-selected-color');

        /* Raising error on saving shift with empty name */
        if (!shiftName.trim()) {
            return $('#shift-name')
                .addClass('error')
                .siblings('.error-message')
                .addClass('active')
                .html('Shift\'s name is required');
        } else {
            $('#shift-name').removeClass('error').siblings('.error-message').removeClass('active');
        }

        const hasCollision = () => {
            let groupKeys = [],
                hasErrors = false;

            $('[data-group-key]').map((i, item) => {
                const groupKey = item.dataset.groupKey;
                if (groupKeys.includes(groupKey) || groupKey === 'new' || groupKey === $shiftElements.attr('data-group-key'))
                    return;
                groupKeys.push(item.dataset.groupKey);
            });

            console.log(groupKeys);

            for (item of groupKeys) {
                $(`[data-group-key][data-group-key="${item}"]`).each((i, item) => {
                    if (item.classList.contains('disabled')) {
                        return;
                    }

                    const shiftParams = $shiftElements.eq(item.dataset.index).get(0).getBoundingClientRect(),
                        shiftTop = Math.round(shiftParams.top),
                        shiftBottom = Math.round(shiftParams.bottom),
                        itemParams = item.getBoundingClientRect(),
                        itemTop = Math.round(itemParams.top),
                        itemBottom = Math.round(itemParams.bottom);

                    console.log(`
                    shiftTop: ${shiftTop},
                    itemTop: ${itemTop},
                    shiftBottom: ${shiftBottom},
                    itemBottom: ${itemBottom}
                    `);

                    if (!(
                        (itemTop < shiftTop && itemBottom < shiftBottom &&  itemBottom <= shiftTop)
                        ||
                        (itemTop > shiftTop && itemBottom > shiftBottom &&  itemTop >= shiftBottom)
                    )) {
                        return hasErrors = !(
                            (itemTop < shiftTop && itemBottom < shiftBottom && itemBottom <= shiftTop)
                            ||
                            (itemTop > shiftTop && itemBottom > shiftBottom && itemTop >= shiftBottom)
                        )
                    };
                });

                if (hasErrors) {
                    return hasErrors;
                }
            }
        };

        if (hasCollision()) {
            return $('.shift-overlay-error')
                .addClass('active');
        } else {
            $('.shift-overlay-error').removeClass('active');
        }

        // const shiftHasCollision = $(`[data-group-key][data-group-key!="${$shiftElements.attr('data-group-key')}"]`).each((i, item) => {
        //     const shift = $shiftElements.eq(item.dataset.index),
        //         itemTop = Math.round(item.getBoundingClientRect().top),
        //         itemBottom = Math.round(item.getBoundingClientRect().bottom),
        //         shiftTop = Math.round(shift.get(0).getBoundingClientRect().top),
        //         shiftBottom = Math.round(shift.get(0).getBoundingClientRect().bottom);
        //
        //     console.log(` shiftBottom: ${shiftBottom}\n itemTop: ${itemTop}\n shiftTop: ${shiftTop}\n itemBottom: ${itemBottom}`);
        //     return shiftBottom > itemTop || shiftTop < itemBottom;
        // });
        //
        // console.log(shiftHasCollision);
        //
        // if (shiftHasCollision) {
        //     return $('.shift-overlay-error')
        //         .addClass('active');
        // } else {
        //     $('.shift-overlay-error').removeClass('active');
        // };

        // console.log(parseInt($shiftElements.css('top')), ($('.shift').height() + parseInt($('.shift').css('top'))));
        // if (parseInt($shiftElements.css('top')) < ($('.shift').height() + parseInt($('.shift').css('top')))) {
        //     $shiftElements.css('border-color', 'tomato');
        //     return $('.shift-overlay-error').addClass('active');
        // }

        $saveBtn.css('display', 'none');
        $('.schedule-settings').removeClass('active');
        $addBtn.css('display', 'block');

        const $editGroup = action === 'update' ?
            $shiftElements
            : action === 'new' ?
                $('[data-group-key="new"]')
                : null;

        /* Setting unique group name for further render */
        $editGroup.attr('data-group-key', `${shiftName}/${diningArea}`);

        /* Shift's parameters for db or localStorage in my case */
        shiftSettings.name = shiftName;
        shiftSettings.area = diningArea;
        shiftSettings.color = shiftColor;
        shiftSettings.groupKey= `${shiftName}/${diningArea}`;
        shiftSettings.yaxis = [];
        shiftSettings.height = [];
        shiftSettings.disabled = [];
        $editGroup.each((index, item) => {
            shiftSettings.height.push(parseInt($(item).css('height')));
            shiftSettings.yaxis.push(parseInt($(item).css('top')));
            if ($(item).hasClass('disabled')) {
                shiftSettings.disabled.push(index);
            }
        });

        /* Hiding shift's elements marked as disabled */
        $('.shift.disabled').css('display', 'none');
        $('.ui-selected').removeClass('ui-selected');

        /* Reseting settings after save */
        $('#shift-name').val('');
        $('#dining-select').val('');
        $('[data-group-key="new"]').remove();

        /* Saving changes to localStorage */
        if (action === 'new') {
            shifts.push(shiftSettings);
            window.localStorage.setItem('shifts', JSON.stringify(shifts));
        } else if (action === 'update') {
            shifts.forEach((item, index) => {
                if (item.groupKey === $editGroup.data('groupKey')) {
                    shifts.splice(index, 1, shiftSettings);
                }
            });
            window.localStorage.setItem('shifts', JSON.stringify(shifts));
            $shiftElements.addClass('completed');
        }

        renderShifts();
    };

    const handleMultipleShiftEvents = (groupKey) => {
        $(window).keydown(keyE => {
            $(window).unbind('click').click(clickE => {
                const $target = $(clickE.target);

                if ($target.attr('data-group-key') === groupKey && keyE.keyCode === 17) {
                    $target.toggleClass('ui-selected');

                    handleMultipleShiftItemsChange($('.ui-selected'));
                } else {
                    const $selected = $('.ui-selected');
                    $selected.removeClass('ui-selected');
                }
            })
        })
            .keyup(() => $(window).unbind('click'));
    };

    const openShiftEditMode = ({
        action = 'new',
        shift,
        $shiftElements
    }) => {
        if (action !== 'cancel')
            $saveBtn.unbind('click').click(() => closeShiftEditMode({
                shift,
                $shiftElements,
                action
            }));

        $shiftElements.each((i, item) => {
            return $(item).hasClass('disabled') ? $(item).css('display', 'flex') : null;
        });
        $('.schedule-settings').addClass('active');
        $addBtn.css('display', 'none');
        $saveBtn.css('display', 'block');

        $('#shift-name').val(shift.name);
        $('#dining-select').val(shift.area);
        $('.color-select').attr('data-selected-color', shift.color);
        $('#shift-color').find('.color-select-preview').css('backgroundColor', shift.color);

        $shiftElements.removeClass('completed');

        $shiftElements.addClass('ui-selected');

        /* Multidragging feature */
        handleMultipleShiftEvents($shiftElements.data('group-key'));

        $('.color-select-list-item').click(e => handleColorSelect(e, $shiftElements));

        $cancelBtn.click(() => {
            closeShiftEditMode({
                action: 'cancel',
                shift,
                $shiftElements
            })
        });

        /* Event for marking shift's item as disabled */
        $shiftElements.children('.shift-symbol').unbind().click(e => {
            $(e.target).parent().toggleClass('disabled');
        });

        handleMultipleShiftItemsChange($shiftElements);
    };

    const handleShiftRemove = e => {
        const groupKey = $(e.target).parent().data('group-key');
        
        shifts.forEach((item, index) => {
            if (item.groupKey === groupKey) {
                shifts.splice(index, 1);
            }
        });
        window.localStorage.setItem('shifts', JSON.stringify(shifts));

        $(`[data-group-key='${groupKey}']`).remove();
    };

    const handleEditShift = e => {
        const $target = $(e.target),
            selectedGroupKey = $target.parent().data('group-key'),
            requiredShift = shifts.find(shift => shift.groupKey === selectedGroupKey ? shift : undefined),
            $selectedShifts = $(`[data-group-key='${selectedGroupKey}'`);


        openShiftEditMode({
            shift: requiredShift,
            $shiftElements: $selectedShifts,
            action: 'update'
        });
    };

    const renderShifts = () => {
        $('.shift').remove();

        shifts.forEach(shift => {
            /* If the day is a day off or shift.disabled array includes current index shift won't be rendered */
            $scheduleCol.each((i, item) => {
                if (workHours[i] === '0') {
                    return;
                }

                /* Adding shift to column */
                let layout = $(item).html();
                layout += generateShift({
                    name: shift.name,
                    topOffset: shift.yaxis[i],
                    height: shift.height[i],
                    groupName: shift.groupKey,
                    color: shift.color,
                    index: i,
                    isCompleted: true,
                    isDisabled: !!shift.disabled.includes(i)
                });
                $(item).html(layout);
            });
        });

        /* Event for deleting and changing shifts */
        $('.disabled').css('display', 'none');
        $('.shift-remove').click(handleShiftRemove);
        $('.shift-edit').click(e => handleEditShift(e));
    };
    /* End Function Declaration block */

    /* Render Block */
    /* Setting data-workday attribute which will further prevent cells from appearing in days' off cols */
    $('.schedule-table-grid-col-heading').each((index, item) => {
        if (workHours[index] !== "0") {
            $(item).attr('data-workday', true);
        }
    });

    /* Reusable time variables */
    let longestWorkingDayInHours = 0;
    let earliestOpeningHour = 24;

    /* Rendering work time column */
    $scheduleCol.each((index, item) => {
        //If days is marked as day off skip it
        if (workHours[index][0] === "0") {
            return false;
        }

        /* Calculate the latest and the earliest hours of working day */
        const startHours = parseInt(convertTime(workHours[index][0])),
            closeHours = parseInt(convertTime(workHours[index][1])),
            workDayInHoursLength = (closeHours - startHours) < 0 ?
                24 - -(closeHours - startHours)
                : closeHours - startHours;

        if (workDayInHoursLength > longestWorkingDayInHours) {
            longestWorkingDayInHours = workDayInHoursLength;
        }

        if (startHours < earliestOpeningHour) {
            earliestOpeningHour = startHours;
        }

        //Generate cells in column according to day's starting and closing hours
        for (let j = 0; j <= workDayInHoursLength; j++) {
            let layout = $(item).html();
            layout += `<div class='schedule-table-grid-cell'></div>`;
            $(item).html(layout);
        }
    });

    /* Render working time column */
    for (let i = 0; i <= longestWorkingDayInHours; i++) {
        let hour = earliestOpeningHour + i;

        if (hour >= 24) {
            hour = -(24 - hour);
        }

        const AmOrPm = hour >= 12 ? 'PM' : 'AM';

        hour = (hour % 12) || 12;

        let layout = $scheduleTime.html();
        layout += `<div class='schedule-table-work-time-item'>${hour + AmOrPm}</div>`;
        $scheduleTime.html(layout);
    }

    /* Shifts render */
    renderShifts();
    /* End Render Block */

    /* Settings section events block */
    /* Custom color select menu events */
    const $selectColor = $('.color-select');

    $selectColor.click(e => {
        $(e.currentTarget).toggleClass('active');
    });

    $addBtn.click(() => {
        $saveBtn.unbind('click').click(() => closeShiftEditMode({action: 'new'}));

        $('.schedule-settings').addClass('active');
        $addBtn.css('display', 'none');
        $saveBtn.css('display', 'block');

        /* Rendering new shift for each column */
        $('[data-workday]').each((index, item) => {
            const $colWrapper = $(item).siblings('.schedule-table-grid-col-wrapper');

            let layout = $colWrapper.html();
            layout += generateShift({index: index});
            $colWrapper.html(layout);
        });

        const $newShift = $('[data-group-key="new"]');

        $newShift.addClass('ui-selected');

        /* Offset */
        $newShift.css({
            top: 80
        });

        /* Event for marking shift's item as disabled */
        $newShift.children('.shift-symbol').unbind().click(e => {
            $(e.target).parent().toggleClass('disabled');
        });

        /* Handle shift position correction after dropping it */
        $('.schedule-table-grid-cell').droppable({
            drop: (e, ui) => {
                const requiredElements = $(ui.draggable[0]).hasClass('ui-selected') ?
                    $('.ui-selected')
                    : $(ui.draggable[0]);

                const position = parseInt(requiredElements.css('top'));

                requiredElements.css('top', 40 * Math.round((position / 40)) + 'px');
            }
        });

        /* Adding jQuery UI methods for dragging and resizing */
        handleMultipleShiftItemsChange($('.ui-selected'));

        $('.color-select-list-item').click(e => handleColorSelect(e, $newShift));

        /* Multidragging feature */
        handleMultipleShiftEvents($newShift.data('group-key'));

        $cancelBtn.click(() => closeShiftEditMode({
            action: 'cancel',
            $shiftElements: $newShift,
        }));
    });
    /* End Settings section events block */
})(jQuery);