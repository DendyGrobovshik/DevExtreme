
import dateUtils from '../../../core/utils/date';

const { trimTime } = dateUtils;

const DATE_NAVIGATOR_CLASS = 'dx-scheduler-navigator';

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
            keyExpr: 'key', // TODO hack for disabling focus on first element
            height: '35px', // Нужен для стилей
            stylingMode,
            onItemClick: function(e) {
                e.itemData.clickHandler(e);

                e.itemElement.removeClass('dx-item-selected dx-state-hover dx-state-focused'); // TODO задать стили для выделения кнопок навигатора
            },
        },
    };
}

function previousButtonOptions(header) {
    return {
        key: 'previous',
        icon: 'chevronprev',
        clickHandler: () => header._updateCurrentDate(DIRECTION_LEFT),

        focusStateEnabled: header.option('focusStateEnabled'),
        tabIndex: header.option('tabIndex'),
        onInitialized: (e) => {
            const previousButton = e.component;

            header._addEvent('min', () => {
                previousButton.option('disabled', isPreviousButtonDisabled);
            });

            header._addEvent('currentDate', () => {
                previousButton.option('disabled', isPreviousButtonDisabled);
            });

            header._addEvent('displayedDate', () => {
                previousButton.option('disabled', isPreviousButtonDisabled);
            });
        },
    };
}

function calendarButtonOptions(header) {
    return {
        key: 'calendar',
        text: header.captionText,
        clickHandler: () => header._showCalendar(header),

        focusStateEnabled: header.option('focusStateEnabled'),
        tabIndex: header.option('tabIndex'),
        onInitialized: (e) => {
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

        focusStateEnabled: header.option('focusStateEnabled'),
        tabIndex: header.option('tabIndex'),
        onInitialized: (e) => {
            const nextButton = e.component;

            header._addEvent('min', () => {
                nextButton.option('disabled', isNextButtonDisabled);
            });

            header._addEvent('currentDate', () => {
                nextButton.option('disabled', isPreviousButtonDisabled);
            });

            header._addEvent('displayedDate', () => {
                nextButton.option('disabled', isPreviousButtonDisabled);
            });
        },
    };
}

function isPreviousButtonDisabled() {
    let min = this.option('min');

    const date = this.date;
    const caption = this._getCaption(date);

    min = min ? trimTime(min) : min;

    return min && !isNaN(min.getTime()) && this._getNextDate(-1, caption.endDate) < min;
}

function isNextButtonDisabled() {
    let max = this.option('max');

    const date = this.date;
    const caption = this._getCaption(date);

    max = max ? trimTime(max) : max;
    max && max.setHours(23, 59, 59);

    return max && !isNaN(max.getTime()) && this._getNextDate(1, caption.startDate) > max;
}
