package pccit.finalproject.javaclient.model;

import javax.swing.table.AbstractTableModel;
import java.util.List;

public class UserTableModel extends AbstractTableModel {
    private final List<User> users;
    private final String[] columnNames = {"ID", "Username", "First Name", "Last Name", "Description", "Password"};

    public UserTableModel(List<User> users) {
        this.users = users;
    }

    @Override
    public int getRowCount() {
        return users.size();
    }

    @Override
    public int getColumnCount() {
        return columnNames.length;
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        User user = users.get(rowIndex);
        switch (columnIndex) {
            case 0: return user.getId();
            case 1: return user.getUsername();
            case 2: return user.getFname();
            case 3: return user.getLname();
            case 4: return user.getDescription();
            case 5: return user.getPwd();
            default: return null;
        }
    }

    @Override
    public String getColumnName(int column) {
        return columnNames[column];
    }

    // 获取用户数据的列表
    public List<User> getUsers() {
        return users;
    }
}
