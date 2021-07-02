import { extend } from '../../../core/utils/extend';
import registerComponent from '../../../core/component_registrator';
import errors from '../../../core/errors';

import Widget from '../../widget/ui.widget';
import Toolbar from '../../toolbar';
import SchedulerCalendar from './calendar';

import {
    getViewSwitcher,
    getDropDownViewSwitcher,
} from './viewSwitcher';
import {
    getDateNavigator
} from './dateNavigator';

import {
    getCaption,
    getNextIntervalDate,
    isDefaultItem,
    validateViews,
    getStep,
} from './utils';

const COMPONENT_CLASS = 'dx-scheduler-header';

const DEFAULT_AGENDA_DURATION = 7;

const SUNDAY_INDEX = 0;

const DEFAULT_ELEMENT = 'defaultElement';


export class SchedulerToolbar extends Widget {
    _getDefaultOptions() {
        return extend(super._getDefaultOptions(), {
            items: [], // Нужен ли здесь дефолт? Или он должен задаваться шедулером?
            date: new Date(),
            currentDate: new Date(),
            currentView: 'day',
            views: [],
            firstDayOfWeek: SUNDAY_INDEX,
            intervalCount: 1,
            useDropDownViewSwitcher: false,
            isAdaptive: false,
            agendaDuration: 7,
            _useShortDateFormat: false,
        });
    }

    _createEventMap() {
        const config = [
            {
                key: 'items',
                value: [this._render],
            },
            {
                key: 'views',
                value: [validateViews],
            },
            {
                key: 'currentDate',
                value: [this._updateCalendarOption('currentDate')],
            },
            {
                key: 'displayedDate',
                value: [this._updateCalendarOption('displayedDate')],
            },
            {
                key: 'min',
                value: [this._updateCalendarOption('min')],
            },
            {
                key: 'max',
                value: [this._updateCalendarOption('max')],
            },
            {
                key: 'tabIndex',
                value: [this._updateCalendarOption('tabIndex')],
            },
            {
                key: 'focusStateEnabled',
                value: [this._updateCalendarOption('focusStateEnabled')],
            },
            {
                key: 'useDropDownViewSwitcher',
                value: [this._render],
            },
        ];

        this.eventMap = new Map();

        config.forEach(({ key, value }) =>
            this.eventMap.set(key, value));
    }

    _addEvent(name, event) {
        if(!this.eventMap.has(name)) {
            this.eventMap.set(name, []);
        }

        const events = this.eventMap.get(name);
        this.eventMap.set(name, [...events, event]);
    }

    _optionChanged(args) {
        const { name, value } = args;

        const events = this.eventMap.get(name);
        if(Array.isArray(events)) {
            events.forEach(event => event(value));
        }
    }

    _init() {
        super._init();
        this.$element().addClass(COMPONENT_CLASS);
    }

    _render() {
        super._render();

        this._createEventMap();

        this._renderToolbar(this.$element());

        this._renderCalendar(this.$element()); // TODO
    }

    _renderToolbar($element) {
        const config = this._createToolbarConfig();

        if(!this._toolbar) {
            this._toolbar = this._createComponent($element, Toolbar, config);
        } else {
            this._toolbar.option('items', config.items);
        }

    }

    _createToolbarConfig() {
        const items = this.option('items');

        const parsedItems = items.map(element => {
            return this._parseItem(element);
        });

        return {
            items: parsedItems,
        };
    }

    _parseItem(item) {
        const isDefaultElement = isDefaultItem(item);

        if(isDefaultElement) {
            const defaultElementType = item[DEFAULT_ELEMENT];

            switch(defaultElementType) {
                case 'viewSwitcher':
                    if(this.option('useDropDownViewSwitcher')) {
                        return getDropDownViewSwitcher(this, item);
                    }

                    return getViewSwitcher(this, item);
                case 'dateNavigator':
                    return getDateNavigator(this, item);
                default:
                    errors.log(`Unknown default element type: ${defaultElementType}`);
                    break;
            }
        }

        return item;
    }

    _updateCurrentView(view) {
        this._notifyObserver('currentViewUpdated', view);

        const events = this.eventMap.get('currentView');
        if(Array.isArray(events)) {
            events.forEach(event => event(view));
        }
    }

    _renderCalendar($element) {
        this._calendar = this._createComponent('<div>', SchedulerCalendar, {
            currentDate: this.option('displayedDate') || this.option('currentDate'), // TODO _updateCalendarOption меняет опции как отдельные
            min: this.option('min'),
            max: this.option('max'),
            firstDayOfWeek: this.option('firstDayOfWeek'),
            focusStateEnabled: this.option('focusStateEnabled'),
            tabIndex: this.option('tabIndex'),
            onValueChanged: (e) => {
                const date = e.value;
                this._notifyObserver('currentDateUpdated', date);

                this._calendar.hide();
            },
        });

        this._calendar.$element().appendTo($element);
    }

    _updateCalendarOption(name) {
        return value => {
            if(this._calendar) {
                this._calendar.option(name, value);
            }
        };
    }

    _getNextDate(direction, initialDate = null) {
        const date = initialDate || this.option('currentDate');
        const options = { ...this.intervalOptions, date };

        return getNextIntervalDate(options, direction);
    }

    // TODO move to dateNavigator
    _getCaption(date) {
        const options = { ...this.intervalOptions, date };
        const customizationFunction = this.option('customizeDateNavigatorText');
        const useShortDateFormat = this.option('_useShortDateFormat');

        return getCaption(options, useShortDateFormat, customizationFunction);
    }

    _updateCurrentDate(direction) {
        const newDate = this._getNextDate(direction);

        this._notifyObserver('currentDateUpdated', newDate);
    }

    _showCalendar(e) {
        this._calendar.show(e.element);
    }

    _hideCalendar() {
        this._calendar.hide();
    }

    // TODO пропатчить текущей вьюхой
    get views() {
        return this.option('views');
    }

    get date() {
        return this.option('displayedDate') || this.option('currentDate');
    }

    // TODO move to dateNavigator
    get captionText() {
        return this._getCaption(this.date).text;
    }

    get intervalOptions() {
        const step = getStep(this.option('currentView'));
        const intervalCount = this.option('intervalCount');
        const firstDayOfWeek = this.option('firstDayOfWeek') || SUNDAY_INDEX; // TODO
        const agendaDuration = this.option('agendaDuration') || DEFAULT_AGENDA_DURATION;

        return { step, intervalCount, firstDayOfWeek, agendaDuration };
    }

    _notifyObserver(subject, args) {
        const observer = this.option('observer');
        if(observer) {
            observer.fire(subject, args);
        }
    }
}

registerComponent('dxSchedulerHeader', SchedulerToolbar);
