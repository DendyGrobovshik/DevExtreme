import devices from '../../../core/devices';
import registerComponent from '../../../core/component_registrator';

import Widget from '../../widget/ui.widget';
import Popover from '../../popover';
import Popup from '../../popup';
import Calendar from '../../calendar';
import Scrollable from '../../scroll_view/ui.scrollable';

const CALENDAR_CLASS = 'dx-scheduler-navigator-calendar';
const CALENDAR_POPOVER_CLASS = 'dx-scheduler-navigator-calendar-popover';

export default class SchedulerCalendar extends Widget {
    show(target) {
        this._popover.option('target', target);
        this._popover.show();

        this._calendar.focus();
    }

    hide() {
        this._popover.hide();
    }

    _keyboardHandler(opts) {
        this._calendar._keyboardHandler(opts);
    }

    _init() {
        super._init();
        this.$element();
    }

    _render() {
        super._render();
        this._renderPopover();
    }

    _renderPopover() {
        this.$element().addClass(CALENDAR_POPOVER_CLASS);

        const _isMobileLayout = this._isMobileLayout();

        const overlayType = _isMobileLayout ? Popup : Popover;

        this._popover = this._createComponent(this.$element(), overlayType, {
            contentTemplate: () => this._createPopupContent(),
            defaultOptionsRules: [
                {
                    device: () => _isMobileLayout,
                    options: {
                        fullScreen: true,
                        showCloseButton: false,
                        toolbarItems: [{ shortcut: 'cancel' }],
                    }
                }
            ],
        });
    }

    _createPopupContent() {
        this._calendar = this._createComponent('<div>', Calendar, this._calendarOptions());
        const result = this._calendar.$element();
        result.addClass(CALENDAR_CLASS);

        if(this._isMobileLayout()) {
            const scrollable = this._createScrollable(result);
            return scrollable.$element();
        }

        return result;
    }

    _createScrollable(content) {
        const result = this._createComponent('<div>', Scrollable, {
            direction: 'vertical'
        });
        result.$content().append(content);

        return result;
    }

    _calendarOptions() {
        return {
            value: this.option('displayedDate') || this.option('currentDate'),
            min: this.option('min'),
            max: this.option('max'),
            firstDayOfWeek: this.option('firstDayOfWeek'),
            _todayDate: () => new Date(), // TODO
            focusStateEnabled: this.option('focusStateEnabled'),
            onValueChanged: this.option('onValueChanged'),
            hasFocus: () => true,
            tabIndex: 1,
        };
    }

    // Опции важно менять для уже открытого календаря
    // (Если календарь закрыт, то при открытии попапа он создасться заново)
    _optionChanged(args) {
        // const { name, value } = args;
    }

    _isMobileLayout() {
        return !devices.current().generic;
    }
}

registerComponent('dxSchedulerCalendarPopup', SchedulerCalendar);
