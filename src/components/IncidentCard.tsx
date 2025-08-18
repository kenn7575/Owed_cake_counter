import React from 'react';
import { CheckCircle, Clock, Calendar, MessageSquare } from 'lucide-react';
import type { CakeIncident } from '../App';

interface IncidentCardProps {
  incident: CakeIncident;
  onToggleDelivered: (id: string, delivered: boolean) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onToggleDelivered }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:scale-105 ${
      incident.cake_delivered
        ? 'border-green-200 bg-green-50'
        : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-800">{incident.person_name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              incident.cake_delivered
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
            }`}>
              {incident.cake_delivered ? 'Cake Delivered' : 'Cake Owed'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Incident: {formatDate(incident.incident_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Reported: {formatDateTime(incident.created_at)}</span>
            </div>
          </div>

          {incident.notes && (
            <div className="flex items-start gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 italic">{incident.notes}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => onToggleDelivered(incident.id, !incident.cake_delivered)}
          className={`ml-4 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 ${
            incident.cake_delivered
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {incident.cake_delivered ? (
            <>
              <Clock className="h-4 w-4 inline mr-1" />
              Mark as Owed
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 inline mr-1" />
              Mark as Delivered
            </>
          )}
        </button>
      </div>
    </div>
  );
};