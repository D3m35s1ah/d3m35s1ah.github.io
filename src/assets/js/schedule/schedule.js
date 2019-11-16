(function($) {
    /* Getting shifts array from localstorage so as to render them */
    const shifts = JSON.parse(window.localStorage.getItem('shifts')) || [];

    /* jQuery core elements declaration block */
    const $addBtn = $('.add-shift-btn');
    const $saveBtn = $('.save-shift-btn');
    const $scheduleTime = $('.schedule-table-work-time');
    const $scheduleCol = $('.schedule-table-grid-col');
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
        isCompleted = false
    }) => {
        return `
        <div class='shift ${isCompleted ? 'completed' : ''}'
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
        const $scheduleHeading = $('.schedule-table-grid-col-heading');

        $selected.draggable({
            axis: 'y',
            containment: [
                0,
                $scheduleHeading.offset().top + 40,
                0,
                $scheduleCol.offset().top + $scheduleCol.height() - 110,
            ],
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
            cancel: '.schedule-table-grid-col-heading',
            resize: e => {
                const $target = $(e.target),
                    groupKey = $target.data('group-key'),
                    top = $target.css('top');

                $(`[data-group-key='${groupKey}']`).css('top', top);
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

    const openShiftEditMode = (shift, $shiftElements) => {
        $('.schedule-settings').addClass('active');
        $addBtn.css('display', 'none');
        $saveBtn.css('display', 'block');

        $('#shift-name').val(shift.name);
        $('#dining-select').val(shift.area);
        $('#shift-color').val(shift.color);

        $shiftElements.removeClass('completed');

        handleMultipleShiftItemsChange($shiftElements);
    };

    const handleShiftRemove = e => {
        const groupKey = $(e.target).parent().data('group-key');

        console.log(groupKey);
        shifts.forEach((item, index) => {
            console.log(item.groupName);
            if (item.groupName === groupKey) {
                shifts.splice(index, 1);
            }
        });
        window.localStorage.setItem('shifts', JSON.stringify(shifts));

        $(`[data-group-key='${groupKey}']`).remove();
    };

    const handleEditShift = e => {
        const $target = $(e.target),
            selectedGroupKey = $target.parent().data('group-key'),
            requiredShift = shifts.reduce(shift => shift.groupKey === selectedGroupKey),
            $selectedShifts = $(`[data-group-key='${selectedGroupKey}'`);

        openShiftEditMode(requiredShift, $selectedShifts);
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
    shifts.forEach(shift => {
        /* If the day is a day off or shift.disabled array includes current index shift won't be rendered */
        $scheduleCol.each((i, item) => {
            if (workHours[i] === '0' || shift.disabled.includes(i)) {
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
            });
            $(item).html(layout);
        });

        /* Event for deleting shifts */
        $('.shift-remove').click(handleShiftRemove);
        $('.shift-edit').click(handleEditShift);
    });
    /* End Render Block */

    /* Settings section events block */
    /* Custom color select menu events */
    const $selectColor = $('.color-select');

    $selectColor.click(e => {
        $(e.currentTarget).toggleClass('active');
    });

    $('.color-select-list-item').click(e => {
        let selectedColor = $(e.currentTarget).attr('data-value');
        $(e.currentTarget).parents('.color-select').find('.color-select-preview').css('backgroundColor', selectedColor);
        $('[data-group-key="new"]').css('backgroundColor', selectedColor);
    });

    $addBtn.click(() => {
        $('.schedule-settings').addClass('active');
        $addBtn.css('display', 'none');
        $saveBtn.css('display', 'block');

        /* Rendering new shift for each column */
        $('[data-workday]').each((index, item) => {
            const $itemParent = $(item).parent();

            let layout = $itemParent.html();
            layout += generateShift({index: index});
            $itemParent.html(layout);
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

        /* Multidragging feature */
        $(window).keydown(keyE => {
            $(window).unbind('click').click(clickE => {
                const $target = $(clickE.target);

                if ($target.attr('data-group-key') === 'new' && keyE.keyCode === 17) {
                    $target.toggleClass('ui-selected');

                    handleMultipleShiftItemsChange($('.ui-selected'));
                } else {
                    const $selected = $('.ui-selected');
                    $selected.draggable('destroy');
                    $selected.resizable('destroy');
                    $selected.removeClass('ui-selected');
                }
            })
        });
    });

    /* Shift save handling */
    $saveBtn.click(() => {
        let shiftSettings = {};
        const shiftName = $('#shift-name').val();
        const diningArea = $('#dining-select').val();
        const shiftColor = $('[data-group-key="new"]').css('backgroundColor');

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

        $saveBtn.css('display', 'none');
        $('.schedule-settings').removeClass('active');
        $addBtn.css('display', 'block');

        const $editGroup = $('[data-group-key="new"]');

        /* Making shift's elements static */
        $editGroup.draggable('destroy');
        $editGroup.resizable('destroy');

        /* Removing configuration items */
        $editGroup.addClass('completed');

        $editGroup.children('.shift-name').html(shiftName);

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

        /* Removing shift's elements marked as disabled */
        $('.shift.disabled').remove();

        /* Reseting settings after save */
        $('#shift-name').val('');
        $('#dining-select').val('');
        $('[data-group-key="new"]').remove();

        /* Adding event to remove button */
        $('.shift-remove').click(handleShiftRemove);

        /* Saving changes to localStorage */
        let localStorageShifts = JSON.parse(window.localStorage.getItem('shifts')) || [];
        localStorageShifts.push(shiftSettings);
        window.localStorage.setItem('shifts', JSON.stringify(localStorageShifts));
    });

    /* Handling shift creation cancel */
    $('.settings-cancel').click(e => {
        $saveBtn.css('display', 'none');
        $('.schedule-settings').removeClass('active');
        $addBtn.css('display', 'block');

        $('#shift-name').val('');
        $('#dining-select').val('');
        $('[data-group-key="new"]').remove();
    })
    /* End Settings section events block */
})(jQuery);