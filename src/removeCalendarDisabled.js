import hotkeys from 'hotkeys-js';
import $       from 'jquery';

hotkeys('ctrl+f1,alt+3', (event) => {
    event.preventDefault();
    $(".calendar-date-disabled").removeClass('calendar-date-disabled');
})
