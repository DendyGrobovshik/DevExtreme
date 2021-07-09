
import dateUtils from '../../../core/utils/date';

const { trimTime } = dateUtils;

const DATE_NAVIGATOR_CLASS = 'dx-scheduler-navigator';

const PREVIOUS_BUTTON_CLASS = 'dx-scheduler-navigator-previous';
const CALENDAR_CAPTION_CLASS = 'dx-scheduler-navigator-caption';
const CALENDAR_BUTTON_CLASS = 'dx-scheduler-navigator-calendar-button';
const NEXT_BUTTON_CLASS = 'dx-scheduler-navigator-next';

const DIRECTION_LEFT = -1;
const DIRECTION_RIGHT = 1;

export function getDateNavigator(header, item) {
    const items = [
        previousButtonOptions(header),
        calendarButtonOptions(header),
        nextButtonOptions(header),
    ];

    // TODO
    const stylingMode = header.option('useDropDownViewSwitcher') ? 'text' : 'contained';

    return {
        ...item,
        widget: 'dxButtonGroup',
        cssClass: DATE_NAVIGATOR_CLASS,
        options: {
            items,
            keyExpr: 'key',
            height: '35px',
            stylingMode,
            onItemClick: function(e) {
                e.itemData.clickHandler(e);
            },
        },
    };
}

// TODO выставить aria
function previousButtonOptions(header) {
    return {
        key: 'previous',
        icon: 'chevronprev',
        clickHandler: () => header._updateCurrentDate(DIRECTION_LEFT),

        elementAttr: { class: PREVIOUS_BUTTON_CLASS, ariaLabel: 'Previous period' },
        onContentReady: (e) => {
            const previousButton = e.component;
            previousButton.option('disabled', isPreviousButtonDisabled(header));


            header._addEvent('min', () => {
                previousButton.option('disabled', isPreviousButtonDisabled(header));
            });

            header._addEvent('currentDate', () => {
                previousButton.option('disabled', isPreviousButtonDisabled(header));
            });

            header._addEvent('displayedDate', () => {
                previousButton.option('disabled', isPreviousButtonDisabled(header));
            });
        },
    };
}

function calendarButtonOptions(header) {
    return {
        key: 'calendar',
        text: header.captionText,
        clickHandler: (e) => header._showCalendar(e),

        elementAttr: { class: `${CALENDAR_CAPTION_CLASS} ${CALENDAR_BUTTON_CLASS}` },
        onContentReady: (e) => {
            const calendarButton = e.component;

            header._addEvent('currentView', () => {
                calendarButton.option('text', header.captionText);
            });

            header._addEvent('currentDate', () => {
                calendarButton.option('text', header.captionText);
            });

            header._addEvent('displayedDate', () => {
                calendarButton.option('text', header.captionText);
            });

            header._addEvent('views', () => {
                calendarButton.option('text', header.captionText);
            });
        },
    };
}

function nextButtonOptions(header) {
    return {
        key: 'next',
        icon: 'chevronnext',
        clickHandler: () => header._updateCurrentDate(DIRECTION_RIGHT),

        elementAttr: { class: NEXT_BUTTON_CLASS },
        onContentReady: (e) => {
            const nextButton = e.component;

            nextButton.option('disabled', isNextButtonDisabled(header));

            header._addEvent('min', () => {
                nextButton.option('disabled', isNextButtonDisabled(header));
            });

            header._addEvent('currentDate', () => {
                nextButton.option('disabled', isNextButtonDisabled(header));
            });

            header._addEvent('displayedDate', () => {
                nextButton.option('disabled', isNextButtonDisabled(header));
            });
        },
    };
}

function isPreviousButtonDisabled(header) {
    let min = header.option('min');

    const date = header.date;
    const caption = header._getCaption(date);

    min = min ? trimTime(min) : min;

    return min && !isNaN(min.getTime()) && header._getNextDate(-1, caption.endDate) < min;
}

function isNextButtonDisabled(header) {
    let max = header.option('max');

    const date = header.date;
    const caption = header._getCaption(date);

    max = max ? trimTime(max) : max;
    max && max.setHours(23, 59, 59);

    return max && !isNaN(max.getTime()) && header._getNextDate(1, caption.startDate) > max;
}
