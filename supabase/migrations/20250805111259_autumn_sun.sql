/*
  # Create cake incidents table

  1. New Tables
    - `cake_incidents`
      - `id` (uuid, primary key)
      - `person_name` (text, required) - Name of the person who owes cake
      - `incident_date` (date, required) - Date when the incident occurred
      - `notes` (text, optional) - Additional notes about the incident
      - `cake_delivered` (boolean, default false) - Whether the cake has been delivered
      - `created_at` (timestamp, auto-generated) - When the record was created

  2. Security
    - Enable RLS on `cake_incidents` table
    - Add policy for public read access (since this is an office tracker)
    - Add policy for public insert/update access
*/

CREATE TABLE IF NOT EXISTS cake_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  cake_delivered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cake_incidents ENABLE ROW LEVEL SECURITY;

-- Allow public read access for office transparency
CREATE POLICY "Anyone can read cake incidents"
  ON cake_incidents
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access for reporting incidents
CREATE POLICY "Anyone can insert cake incidents"
  ON cake_incidents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public updates for marking cakes as delivered
CREATE POLICY "Anyone can update cake incidents"
  ON cake_incidents
  FOR UPDATE
  TO public
  USING (true);