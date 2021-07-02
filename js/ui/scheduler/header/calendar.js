import devices from '../../../core/devices';
import registerComponent from '../../../core/component_registrator';

import Widget from '../../widget/ui.widget';
import Popover from '../../popover';
import Popup from '../../popup';
import Calendar from '../../calendar';

const CALENDAR_CLASS = 'dx-scheduler-navigator-calendar';
const CALENDAR_POPOVER_CLASS = 'dx-scheduler-navigator-calendar-popover';

export default class SchedulerCalendar extends Widget {
    show(target) {
        this._popover.option('target', target);
        this._popover.toggle();
    }

    hide() {
        this._popover.hide();
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
        const isMobileLayout = this._isMobileLayout();

        this.$element().addClass(CALENDAR_POPOVER_CLASS);

        const overlayType = isMobileLayout ? Popup : Popover;

        this._popover = this._createComponent(this.$element(), overlayType, {
            contentTemplate: () => this._createPopupContent(),
            defaultOptionsRules: [
                {
                    device: () => isMobileLayout,
                    options: {
                        fullScreen: true,
                        showCloseButton: false,
                        toolbarItems: [{ shortcut: 'cancel' }],
                    }
                },
                {
                    device: () => !isMobileLayout,
                    // options: {
                    //     target: this.option('target'),
                    // }
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


    _calendarOptions() {
        return {
            value: this.option('currentDate'),
            min: this.option('min'),
            max: this.option('max'),
            firstDayOfWeek: this.option('firstDayOfWeek'),
            _todayDate: () => new Date(), // TODO
            focusStateEnabled: this.option('focusStateEnabled'),
            onValueChanged: this.option('onValueChanged'),
            hasFocus: function() { return true; },
            tabIndex: null,
        };
    }

    _isMobileLayout() {
        return !devices.current().generic;
    }
}

registerComponent('dxSchedulerCalendarPopup', SchedulerCalendar);
