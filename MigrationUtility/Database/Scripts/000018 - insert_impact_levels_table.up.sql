INSERT INTO permission_impact_levels (name,slug,description)
VALUES ( 'Low Impact','LOW_IMPACT','Read User Data'),
       ( 'Medium Impact','MEDIUM_IMPACT','Update temporary data like sessions'),
       ( 'High Impact','HIGH_IMPACT','Modify user data'),
       ( 'Critical Impact','CRITICAL_IMPACT','Delete user data')
ON CONFLICT DO NOTHING;