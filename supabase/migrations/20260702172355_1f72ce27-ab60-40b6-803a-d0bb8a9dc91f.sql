
-- Allow admins/super_admins/staff to read profiles and user_roles for user management
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'hod') OR has_role(auth.uid(),'finance') OR has_role(auth.uid(),'pm'));

CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'hod'));

CREATE POLICY "Admins read enrollments" ON public.enrollments FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'hod') OR has_role(auth.uid(),'instructor'));

CREATE POLICY "Admins update enrollments" ON public.enrollments FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));

CREATE POLICY "Admins read payments" ON public.payments FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'finance'));
