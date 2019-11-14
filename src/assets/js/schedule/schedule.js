(function($) {
    const shifts = JSON.parse(window.localStorage.getItem('shifts')) || [];

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
          ["06:00 AM","01:00 AM"]];

    $('.schedule-table-grid-col-heading').each((index, item) => {
      if (workHours[index] !== "0") {
        $(item).attr('data-workday', true);
      }
    });

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
            <div class='shift-resizer shift-resizer-top'></div>
            <span class='shift-symbol'></span>
            <h5 class='shift-name'>${name}</h5>
            <h4 class='shift-remove'>x</h4>
            <div class='shift-resizer shift-resizer-bottom'></div>
          </div>
          `
        };

        const $selectColor = $('.color-select');

        $selectColor.click(e => {
          $(e.currentTarget).toggleClass('active');
        });

        $('.color-select-list-item').click(e => {
          let selectedColor = $(e.currentTarget).attr('data-value');
          $(e.currentTarget).parents('.color-select').find('.color-select-preview').css('backgroundColor', selectedColor);
          $('[data-group-key="new"]').css('backgroundColor', selectedColor);
        });

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
        }

        let longestWorkingDayInHours = 0;
        let earliestOpeningHour = 24;

          $scheduleCol.each((index, item) => {
            if (workHours[index][0] === "0") {
              return false;
            }

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

            for (let j = 0; j <= workDayInHoursLength; j++) {
              let layout = $(item).html();
              layout += `<div class='schedule-table-grid-cell'></div>`;
              $(item).html(layout);
            }
          })

          shifts.forEach(shift => {
            $scheduleCol.each((i, item) => {
              if (workHours[i] == '0' || shift.disabled.includes(i)) {
                return;
              }

              let layout = $(item).html();
              layout += generateShift({
                name: shift.name,
                topOffset: shift.yaxis[i],
                height: shift.height[i],
                groupName: shift.name,
                color: shift.color,
                index: i,
                isCompleted: true,
              });
              $(item).html(layout);
            });

            $('.shift-remove').click(e => {
              const groupKey = $(e.target).parent().data('group-key');

              shifts.forEach((item, index) => {
                if (item.name === groupKey) {
                  shifts.splice(index, 1);
                }
              });
              window.localStorage.setItem('shifts', JSON.stringify(shifts));

              $(`[data-group-key='${groupKey}']`).remove();
            });
          })

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

        $addBtn.click(() => {
          $('.schedule-settings').addClass('active');
          $addBtn.css('display', 'none');
          $saveBtn.css('display', 'block');

          $('[data-workday]').each((index, item) => {
            const $itemParent = $(item).parent();

            let layout = $itemParent.html();
            layout += generateShift({index: index});
            $itemParent.html(layout);

            $('[data-group-key="new"]').css({
              top: 80
            });

            $('[data-group-key="new"] .shift-symbol').unbind().click(e => {
              console.log('click');
              $(e.target).parent().toggleClass('disabled');
            })

            $('[data-group-key="new"]').resizable({
              minHeight: 40,
              handles: 'n,s',
              stop: (e, ui) => {
                const height = parseInt(ui.element[0].style.height);
                ui.element[0].style.height = 40 * Math.round((height / 40)) + 'px';
              }
            });

            $('[data-group-key="new"]').draggable({
              axis: 'y',
              containment: [
                0,
                $('[data-group-key="new"]').offset().top - 40,
                0,
                $scheduleCol.offset().top + $scheduleCol.height() - 110,
              ]
            });

            $('.schedule-table-grid-cell').droppable({
              drop: (e, ui) => {
                const position = parseInt(ui.draggable[0].style.top);
                ui.draggable[0].style.top = 40 * Math.round((position / 40)) + 'px';
              }
            })
          })
        })

        $saveBtn.click(() => {
          let shiftSettings = {};
          let shiftName = $('#shift-name').val();
          let diningArea = $('#dining-select').val();
          let shiftColor = $('[data-group-key="new"]').css('backgroundColor');

          if (!shiftName.trim()) {
            return;
          }

          $saveBtn.css('display', 'none');
          $('.schedule-settings').removeClass('active');
          $addBtn.css('display', 'block');

          const $editGroup = $('[data-group-key="new"]');

          $editGroup.draggable('disable');
          $editGroup.resizable('disable');

          $editGroup.addClass('completed');

          $editGroup.children('.shift-name').html(shiftName);

          $editGroup.attr('data-group-key', shiftName);

          shiftSettings.name = shiftName;
          shiftSettings.area = diningArea;
          shiftSettings.color = shiftColor;
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

          $('.shift.disabled').remove();

          let localStorageShifts = JSON.parse(window.localStorage.getItem('shifts')) || [];
          localStorageShifts.push(shiftSettings);
          window.localStorage.setItem('shifts', JSON.stringify(localStorageShifts));
        })

        $('.settings-cancel').click(e => {
          $saveBtn.css('display', 'none');
          $('.schedule-settings').removeClass('active');
          $addBtn.css('display', 'block');

          $('#shift-name').val('')
          $('#dining-select').val('')
          $('[data-group-key="new"]').remove();
        })
})(jQuery);