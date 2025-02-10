package pccit.finalproject.javaclient.view;

import javax.swing.*;
import java.awt.*;

public class AdminDashboard extends JFrame {
    private LoginPanel loginPanel;
    private JTable userTable;

    public AdminDashboard() {
        setTitle("Admin Dashboard");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        loginPanel = new LoginPanel();
        add(loginPanel, BorderLayout.NORTH);

        userTable = new JTable();
        add(new JScrollPane(userTable), BorderLayout.CENTER);

        setVisible(true);
    }

    public LoginPanel getLoginPanel() { return loginPanel; }
    public JTable getUserTable() { return userTable; }
}
