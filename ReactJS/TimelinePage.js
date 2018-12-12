import React, {PropTypes} from "react";
import classNames from "classnames";
import {createSelector} from "reselect";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

// common components
import BaseHousePage from "common/parts/BaseHousePage";

// timeline page blocks
import EventsPageBlock from "pages/timeline/events/EventsPageBlock";

// actions
import houseActions from "common/actions/HouseActions";
import eventsPageBlockActions from "pages/timeline/events/EventsPageBlockActions";
import customerHousesActions from "common/actions/CustomerHousesActions";
import filtersActions from "common/actions/FiltersActions";
import communicationTypeActions from "pages/timeline/events/communication/CommunicationTypeActions";
import communicationUrlsActions from "pages/timeline/events/communication/CommunicationUrlsActions";

// utils
import {toActionsCreators} from "common/utils/ActionsUtils";

// other
import AddEventItemModalDialog from "pages/timeline/events/AddEventItemModalDialog";

const customerHousesSelector = state => state.get("customerHouses");
const filtersSelector = (state) => state.get("filters");
const eventsSelector = state => state.getIn(["timeline", "events"]);
const communicationSelector = state => state.getIn(["timeline", "communication"]);
const userSelector = state => state.getIn(["authentication", "user"]);

const timelinePageSelector = createSelector([
    eventsSelector,
    customerHousesSelector,
    filtersSelector,
    communicationSelector,
    userSelector
], (events, houses, filters, communication, user) => {
    return {
        events,
        eventToAdd: events.get("eventToAdd"),
        houses,
        filters,
        communicationType: communication.get("types"),
        communicationUrls: communication.get("urls"),
        user
    };
});

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(toActionsCreators([
            houseActions,
            communicationTypeActions,
            communicationUrlsActions,
            customerHousesActions,
            filtersActions,
            eventsPageBlockActions
        ]), dispatch)
    };
};

@connect(timelinePageSelector, mapDispatchToProps, null, {pure: false})
export default class TimelinePage extends BaseHousePage {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        communicationType: PropTypes.object,
        communicationUrls: PropTypes.object,
        events: PropTypes.object,
        eventToAdd: PropTypes.object,
        filters: PropTypes.object,
        houses: PropTypes.object,
        user: PropTypes.object
    };

    componentDidMount() {
        const {actions} = this.props;
        actions.fetchCommunicationTypes();
    }

    handleAddEventModalClose = () => {
        this.props.actions.toggleAddEventDialog();
    };

    handleAddEvent = (data) => {
        const {actions} = this.props;
        const {selectedHouse} = this.context;
        const house = selectedHouse.get("content");
        const customerId = house.owner.id;
        actions.addEvent({event: data, customerId});
    };

    renderModal() {
        const {actions, eventToAdd, communicationType, user} = this.props;
        const {selectedHouse} = this.context;

        if (!eventToAdd) {
            return null;
        }

        return (
            <AddEventItemModalDialog
                actions={actions}
                error={eventToAdd.get("error") || communicationType.get("error")}
                isLoading={eventToAdd.get("isLoading") || communicationType.get("isLoading")}
                key="EventsToAddModal"
                onAddEvent={this.handleAddEvent}
                onClose={this.handleAddEventModalClose}
                selectedHouse={selectedHouse.get("content")}
                types={communicationType.get("content")}
                user={user} />
        );
    }

    renderContent() {
        const {actions, communicationUrls, events, filters, houses} = this.props;
        const {router, selectedHouse} = this.context;

        const isLoading = (events.get("isLoading") && !events.get("iterable"))
            || houses.get("isLoading")
            || (events.getIn(["eventChoices", "isLoading"]) && !events.getIn(["eventChoices", "content"]));

        const results = events.getIn(["iterable", "results"]);

        const eventPageBlockClass = classNames({
            "app-crm-events-page-block": !isLoading
                && !events.get("error")
                && (results && !results.isEmpty())
        });
        return (
            <div className="ezh-content-sections ezh-content-sections-info">
                <EventsPageBlock
                    actions={actions}
                    className={eventPageBlockClass}
                    communicationUrls={communicationUrls}
                    error={events.get("error") || events.getIn(["eventChoices", "error"])}
                    events={events}
                    filters={filters}
                    houses={houses}
                    isLoading={isLoading}
                    router={router}
                    selectedHouse={selectedHouse}/>
                {this.renderModal()}
            </div>
        );
    }
}
